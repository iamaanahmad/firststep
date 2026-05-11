import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface DashboardEvent {
  type: string;
  userId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  serverTimestamp: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  funnel: {
    landing: number;
    featureClick: number;
    walletConnect: number;
    txSend: number;
    success: number;
  };
  sponsoredTxCount: number;
  sponsoredTxCost: number;
  guestModeCount: number;
  upgradeCount: number;
  failedTxCount: number;
  guestToUpgradeRate: string;
  rawEventCount: number;
  recommendations: DashboardRecommendation[];
}

export interface DashboardRecommendation {
  title: string;
  detail: string;
  trigger: string;
  priority: "high" | "medium" | "low";
}

interface PersistedEventStore {
  events: DashboardEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const EVENTS_FILE_PATH = path.join(DATA_DIR, "analytics-events.json");

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(EVENTS_FILE_PATH, "utf-8");
  } catch {
    const initialStore: PersistedEventStore = { events: [] };
    await writeFile(EVENTS_FILE_PATH, JSON.stringify(initialStore, null, 2), "utf-8");
  }
}

async function readStore(): Promise<PersistedEventStore> {
  await ensureStore();

  const raw = await readFile(EVENTS_FILE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as PersistedEventStore;

  if (!parsed || !Array.isArray(parsed.events)) {
    return { events: [] };
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseEvent(value: unknown): DashboardEvent | null {
  if (!isRecord(value)) return null;
  if (typeof value.type !== "string") return null;
  if (typeof value.userId !== "string") return null;
  if (typeof value.timestamp !== "number") return null;

  return {
    type: value.type,
    userId: value.userId,
    timestamp: value.timestamp,
    metadata: isRecord(value.metadata) ? value.metadata : undefined,
    serverTimestamp:
      typeof value.serverTimestamp === "string"
        ? value.serverTimestamp
        : new Date().toISOString(),
  };
}

function normalizeEventType(type: string): string {
  if (type === "feature_clicked") return "feature_click";
  return type;
}

export async function appendEvents(events: unknown[]): Promise<number> {
  const store = await readStore();

  const validEvents = events
    .map((event) => parseEvent(event))
    .filter((event): event is DashboardEvent => event !== null)
    .map((event) => ({
      ...event,
      type: normalizeEventType(event.type),
      serverTimestamp: new Date().toISOString(),
    }));

  if (validEvents.length === 0) {
    return 0;
  }

  store.events.push(...validEvents);

  await writeFile(EVENTS_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");

  return validEvents.length;
}

export async function getEvents(): Promise<DashboardEvent[]> {
  const store = await readStore();
  return store.events;
}

export function aggregateMetrics(events: DashboardEvent[]): DashboardMetrics {
  const landingCount = events.filter((e) => e.type === "landing_view").length;
  const guestModeCount = events.filter((e) => e.type === "user_guest_mode").length;
  const walletConnectCount = events.filter(
    (e) => e.type === "wallet_connect" || e.type === "user_upgraded"
  ).length;
  const featureClickCount = events.filter((e) => e.type === "feature_click").length;
  const txSignCount = events.filter((e) => e.type === "tx_sign").length;
  const txSuccessCount = events.filter((e) => e.type === "tx_success").length;
  const failedTxCount = events.filter((e) => e.type === "tx_failed").length;
  const sponsoredTxCount = events.filter((e) => e.type === "tx_sponsored").length;
  const sponsoredTxCost = events
    .filter((e) => e.type === "tx_sponsored")
    .reduce((sum, event) => {
      const amount = event.metadata?.amount;
      return sum + (typeof amount === "number" ? amount : 5000);
    }, 0);

  const recommendations = buildRecommendations({
    landingCount,
    guestModeCount,
    featureClickCount,
    walletConnectCount,
    txSignCount,
    txSuccessCount,
    failedTxCount,
    sponsoredTxCount,
  });

  return {
    totalUsers: new Set(events.map((e) => e.userId)).size,
    funnel: {
      // Fallback for older sessions that emitted no landing event.
      landing: landingCount > 0 ? landingCount : guestModeCount,
      featureClick: featureClickCount,
      walletConnect: walletConnectCount,
      txSend: txSignCount,
      success: txSuccessCount,
    },
    sponsoredTxCount,
    sponsoredTxCost,
    guestModeCount,
    upgradeCount: events.filter((e) => e.type === "user_upgraded").length,
    failedTxCount,
    guestToUpgradeRate:
      guestModeCount > 0
        ? ((events.filter((e) => e.type === "user_upgraded").length / guestModeCount) * 100).toFixed(2)
        : "0",
    rawEventCount: events.length,
    recommendations,
  };
}

interface RecommendationInputs {
  landingCount: number;
  guestModeCount: number;
  featureClickCount: number;
  walletConnectCount: number;
  txSignCount: number;
  txSuccessCount: number;
  failedTxCount: number;
  sponsoredTxCount: number;
}

function buildRecommendations(inputs: RecommendationInputs): DashboardRecommendation[] {
  const recommendations: DashboardRecommendation[] = [];

  const landingDrop = percentDrop(inputs.landingCount, inputs.featureClickCount);
  const featureDrop = percentDrop(inputs.featureClickCount, inputs.walletConnectCount);
  const walletDrop = percentDrop(inputs.walletConnectCount, inputs.txSignCount);
  const signDrop = percentDrop(inputs.txSignCount, inputs.txSuccessCount);

  if (inputs.landingCount >= 5 && landingDrop >= 30) {
    recommendations.push({
      title: "Promote guest mode earlier",
      detail:
        "A large share of users leave before the first meaningful action. Make the guest CTA the primary path and shorten the value proposition above the fold.",
      trigger: `${landingDrop.toFixed(0)}% drop before feature click`,
      priority: "high",
    });
  }

  if (inputs.featureClickCount >= 3 && featureDrop >= 25) {
    recommendations.push({
      title: "Explain the wallet step in plain language",
      detail:
        "Users are interested, but they hesitate before connecting a wallet. Add an embedded wallet or a social-login upgrade so the app does not force seed phrase anxiety.",
      trigger: `${featureDrop.toFixed(0)}% drop before wallet connect`,
      priority: "high",
    });
  }

  if (inputs.walletConnectCount >= 3 && walletDrop >= 20) {
    recommendations.push({
      title: "Sponsor the first action",
      detail:
        "Users reach wallet connect, but fewer finish the transaction. Use a sponsored first transaction and a clear 'Gas Sponsored' badge to remove the final fee objection.",
      trigger: `${walletDrop.toFixed(0)}% drop before tx sign`,
      priority: "medium",
    });
  }

  if (inputs.txSignCount >= 2 && signDrop >= 15) {
    recommendations.push({
      title: "Reduce signing failures",
      detail:
        "Signing is happening, but not all attempts complete successfully. Show a preflight estimate, surface insufficient-SOL guidance, and keep the failure copy actionable.",
      trigger: `${signDrop.toFixed(0)}% drop before success`,
      priority: "medium",
    });
  }

  if (inputs.sponsoredTxCount > 0 && inputs.failedTxCount > inputs.sponsoredTxCount * 0.5) {
    recommendations.push({
      title: "Audit sponsor policy and error handling",
      detail:
        "Sponsored activity is active, but the failure rate is still elevated. Check sponsor limits, retry behavior, and whether users are getting clear recovery paths after failure.",
      trigger: `${inputs.failedTxCount} failed txs vs ${inputs.sponsoredTxCount} sponsored txs`,
      priority: "low",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Keep the funnel visible",
      detail:
        "The current funnel is healthy enough that the next win is visibility. Keep tracking guest-to-upgrade conversion and compare sponsor costs against success rate.",
      trigger: "No major funnel bottleneck detected",
      priority: "low",
    });
  }

  return recommendations.slice(0, 4);
}

function percentDrop(fromCount: number, toCount: number): number {
  if (fromCount <= 0) return 0;
  const retained = (toCount / fromCount) * 100;
  return Math.max(0, 100 - retained);
}
