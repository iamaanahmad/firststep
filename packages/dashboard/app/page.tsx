"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Layers3,
  Send,
  TriangleAlert,
  UsersRound,
  WalletCards,
} from "lucide-react";

interface Metrics {
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
  recommendations: {
    title: string;
    detail: string;
    trigger: string;
    priority: "high" | "medium" | "low";
  }[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/metrics");
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 20px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#86efac",
                border: "1px solid rgba(110, 231, 183, 0.16)",
                marginBottom: "12px",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              <Activity size={14} />
              Live onboarding telemetry
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <img src="/FirstStepLogo.png" alt="FirstStep Logo" style={{ height: "48px" }} />
              <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
                Dashboard
              </h1>
            </div>
            <p style={{ margin: "10px 0 0", color: "#94a3b8", maxWidth: "68ch", lineHeight: 1.7 }}>
              Track guest mode adoption, wallet upgrades, sponsored transactions,
              and the exact points where users drop out of the funnel.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "18px",
              background: "rgba(15, 23, 42, 0.56)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.24)",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "13px" }}>Refresh rate</div>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "rgba(2, 6, 23, 0.75)",
                color: "#e2e8f0",
              }}
            >
              <option value={1}>1s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(127, 29, 29, 0.38)",
              border: "1px solid rgba(248, 113, 113, 0.22)",
              borderRadius: "18px",
              padding: "14px 16px",
              marginBottom: "20px",
              color: "#fecaca",
            }}
          >
            <TriangleAlert size={16} />
            <span>Error: {error}</span>
          </div>
        )}

        {loading && !metrics && (
          <div
            style={{
              textAlign: "center",
              color: "#94a3b8",
              padding: "56px 24px",
              background: "rgba(15, 23, 42, 0.54)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              borderRadius: "24px",
            }}
          >
            Loading metrics...
          </div>
        )}

        {metrics && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <MetricCard
                label="Total Users"
                value={metrics.totalUsers}
                subtext={`${metrics.guestModeCount} guests, ${metrics.upgradeCount} upgraded`}
                icon={UsersRound}
              />
              <MetricCard
                label="Guest to Upgrade Rate"
                value={`${metrics.guestToUpgradeRate}%`}
                subtext={`${metrics.upgradeCount} / ${metrics.guestModeCount} users`}
                icon={ArrowRight}
              />
              <MetricCard
                label="Sponsored Transactions"
                value={metrics.sponsoredTxCount}
                subtext={`${(metrics.sponsoredTxCost / 1e9).toFixed(2)} SOL cost`}
                icon={BadgeDollarSign}
              />
              <MetricCard
                label="Failed Transactions"
                value={metrics.failedTxCount}
                subtext="Issues to investigate"
                variant="warning"
                icon={TriangleAlert}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.85fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.62)",
                  borderRadius: "28px",
                  padding: "24px",
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                  boxShadow: "0 32px 80px rgba(2, 6, 23, 0.34)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>Onboarding funnel</h2>
                    <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                      Landing to success conversion at a glance.
                    </p>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#86efac", fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    Live data
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <FunnelStep
                    label="Landing Page"
                    value={metrics.guestModeCount}
                    isBase={true}
                  />
                  <FunnelStep
                    label="Feature Clicked"
                    value={metrics.funnel.featureClick}
                    total={metrics.guestModeCount}
                  />
                  <FunnelStep
                    label="Wallet Connected / Upgraded"
                    value={metrics.upgradeCount}
                    total={metrics.guestModeCount}
                  />
                  <FunnelStep
                    label="Transaction Sent"
                    value={metrics.funnel.txSend}
                    total={metrics.guestModeCount}
                  />
                  <FunnelStep
                    label="Transaction Success"
                    value={metrics.funnel.success}
                    total={metrics.guestModeCount}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                <InfoPanel
                  icon={WalletCards}
                  title="Guest sessions"
                  value={`${metrics.guestModeCount}`}
                  note="Sessions that started in preview mode"
                />
                <InfoPanel
                  icon={Send}
                  title="Sponsored sends"
                  value={`${metrics.sponsoredTxCount}`}
                  note="Actions the sponsor pool covered"
                />
                <InfoPanel
                  icon={Clock3}
                  title="Last refresh"
                  value={new Date().toLocaleTimeString()}
                  note="Dashboard polling interval: live"
                />
              </div>
            </div>

            <div
              style={{
                marginBottom: "24px",
                background: "rgba(15, 23, 42, 0.62)",
                borderRadius: "28px",
                padding: "24px",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                boxShadow: "0 32px 80px rgba(2, 6, 23, 0.34)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "baseline", flexWrap: "wrap", marginBottom: "18px" }}>
                <div>
                  <h2 style={{ margin: 0 }}>What to fix next</h2>
                  <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                    Automated product recommendations based on the funnel shape.
                  </p>
                </div>
                <div style={{ color: "#86efac", fontWeight: 700 }}>
                  {metrics.recommendations.length} active recommendation{metrics.recommendations.length === 1 ? "" : "s"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                {metrics.recommendations.map((item) => (
                  <RecommendationCard key={`${item.title}-${item.trigger}`} item={item} />
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(15, 23, 42, 0.62)",
                borderRadius: "28px",
                padding: "24px",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                boxShadow: "0 32px 80px rgba(2, 6, 23, 0.34)",
                backdropFilter: "blur(20px)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Debug info</h3>
              <div style={{ display: "grid", gap: "10px", color: "#cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span>Raw events recorded</span>
                  <strong>{metrics.rawEventCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span>Guest sessions</span>
                  <strong>{metrics.guestModeCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span>Guest to upgrade rate</span>
                  <strong>{metrics.guestToUpgradeRate}%</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "warning";
  icon: typeof UsersRound;
}

function MetricCard({ label, value, subtext, variant = "default", icon: Icon }: MetricCardProps) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72))",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
        border:
          variant === "warning"
            ? "1px solid rgba(251, 146, 60, 0.22)"
            : "1px solid rgba(96, 165, 250, 0.18)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>{label}</div>
        <Icon size={16} color={variant === "warning" ? "#fb923c" : "#67e8f9"} />
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px", color: "#f8fafc" }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{subtext}</div>
      )}
    </div>
  );
}

interface InfoPanelProps {
  icon: typeof Layers3;
  title: string;
  value: string;
  note: string;
}

interface RecommendationCardProps {
  item: {
    title: string;
    detail: string;
    trigger: string;
    priority: "high" | "medium" | "low";
  };
}

function RecommendationCard({ item }: RecommendationCardProps) {
  const tone =
    item.priority === "high"
      ? { border: "rgba(248, 113, 113, 0.24)", chip: "#fca5a5", chipBg: "rgba(127, 29, 29, 0.34)" }
      : item.priority === "medium"
        ? { border: "rgba(251, 146, 60, 0.24)", chip: "#fdba74", chipBg: "rgba(154, 52, 18, 0.3)" }
        : { border: "rgba(96, 165, 250, 0.22)", chip: "#93c5fd", chipBg: "rgba(30, 58, 138, 0.28)" };

  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "20px",
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72))",
        border: `1px solid ${tone.border}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ fontWeight: 700, color: "#f8fafc" }}>{item.title}</div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tone.chip,
            background: tone.chipBg,
            borderRadius: "999px",
            padding: "5px 8px",
          }}
        >
          {item.priority}
        </span>
      </div>
      <div style={{ color: "#cbd5e1", lineHeight: 1.65, fontSize: "13px", marginBottom: "12px" }}>{item.detail}</div>
      <div style={{ color: "#86efac", fontSize: "12px", fontWeight: 700 }}>{item.trigger}</div>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, value, note }: InfoPanelProps) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72))",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ color: "#94a3b8", fontSize: "13px" }}>{title}</div>
        <Icon size={16} color="#67e8f9" />
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, margin: "10px 0 6px", color: "#f8fafc" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>{note}</div>
    </div>
  );
}

interface FunnelStepProps {
  label: string;
  value: number;
  total?: number;
  isBase?: boolean;
}

function FunnelStep({ label, value, total, isBase }: FunnelStepProps) {
  const percentage = total && total > 0 ? (value / total) * 100 : 100;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          gap: "16px",
        }}
      >
        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{label}</span>
        <span style={{ color: "#94a3b8" }}>
          {value} {total && !isBase && `(${percentage.toFixed(1)}%)`}
        </span>
      </div>
      <div
        style={{
          backgroundColor: "rgba(148, 163, 184, 0.16)",
          borderRadius: "999px",
          height: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #22c55e 0%, #38bdf8 100%)",
            height: "100%",
            width: `${isBase ? 100 : percentage}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
