import React from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export interface GuestModeBannerProps {
  transactionsRemaining: number;
  onUpgrade?: () => void;
}

/**
 * GuestModeBanner - Displays guest mode status and transaction limit
 */
export const GuestModeBanner: React.FC<GuestModeBannerProps> = ({
  transactionsRemaining,
  onUpgrade,
}) => {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(30, 41, 59, 0.76))",
        border: "1px solid rgba(96, 165, 250, 0.18)",
        borderRadius: "22px",
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 22px 50px rgba(2, 6, 23, 0.26)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))",
            color: "#93c5fd",
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#e2e8f0",
              fontWeight: 700,
              fontSize: "15px",
              marginBottom: "4px",
            }}
          >
            <ShieldCheck size={15} color="#6ee7b7" />
            Preview mode
          </div>
          <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>
            You are browsing with a guest account. <strong>{transactionsRemaining}</strong>{" "}
            free transactions remaining.
          </p>
        </div>
      </div>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #22c55e, #3b82f6)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            padding: "12px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontWeight: 700,
            boxShadow: "0 16px 34px rgba(34, 197, 94, 0.22)",
          }}
        >
          Connect Wallet
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};
