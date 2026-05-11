// FirstStep SDK Type Definitions

export interface FirstStepConfig {
  appId: string;
  sponsorPolicy?: SponsorshipPolicy;
  sponsorProgramId?: string;
  apiUrl?: string;
  devnet?: boolean;
}

export interface SponsorshipPolicy {
  maxTransactionsPerUser: number;
  maxSpendPerUser: number;
  maxSpendPerApp: number;
}

export interface GuestSession {
  publicKey: string;
  isEphemeral: boolean;
  transactionCount: number;
  createdAt: number;
}

export interface TransactionResult {
  signature: string;
  status: "success" | "failed" | "pending";
  sponsored: boolean;
  error?: string;
}

export type AnalyticsEventType =
  | "landing_view"
  | "feature_click"
  | "action_initiated"
  | "user_guest_mode"
  | "wallet_connect"
  | "wallet_disconnect"
  | "user_upgraded"
  | "tx_sign"
  | "tx_sent"
  | "tx_success"
  | "tx_sponsored"
  | "tx_failed";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  userId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
