import React, { useState } from "react";
import { ArrowRight, Wallet, X } from "lucide-react";

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

/**
 * UpgradeModal - Prompt to upgrade from guest to full wallet
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(2, 6, 23, 0.72)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "24px",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          borderRadius: "28px",
          padding: "28px",
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92))",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 36px 90px rgba(2, 6, 23, 0.45)",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))",
            color: "#93c5fd",
            marginBottom: "18px",
          }}
        >
          <Wallet size={24} />
        </div>

        <h2 style={{ margin: "0 0 10px 0", fontSize: "2rem" }}>Upgrade to full wallet</h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          You’ve used your free transactions. Connect a wallet to keep going,
          unlock the full app, and keep the onboarding state linked to your account.
        </p>

        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px 16px",
              backgroundColor: "rgba(15, 23, 42, 0.58)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              color: "#e2e8f0",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <X size={16} />
              Cancel
            </span>
          </button>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "13px 16px",
              background: "linear-gradient(135deg, #22c55e, #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: 700,
              opacity: isLoading ? 0.7 : 1,
              boxShadow: "0 18px 36px rgba(34, 197, 94, 0.24)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              {isLoading ? "Connecting..." : "Connect Wallet"}
              {!isLoading && <ArrowRight size={16} />}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
