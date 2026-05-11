import React from "react";
import { Sparkles } from "lucide-react";

export interface GasSponsoredBadgeProps {
  sponsored: boolean;
  cost?: number;
}

/**
 * GasSponsoredBadge - Shows if transaction is sponsored
 */
export const GasSponsoredBadge: React.FC<GasSponsoredBadgeProps> = ({
  sponsored,
  cost,
}) => {
  if (!sponsored) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background:
          "linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(59, 130, 246, 0.14))",
        border: "1px solid rgba(110, 231, 183, 0.28)",
        borderRadius: "999px",
        padding: "7px 12px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#6ee7b7",
      }}
    >
      <Sparkles size={14} />
      Gas Sponsored
      {cost && <span style={{ color: "#cbd5e1" }}>-{cost} lamports</span>}
    </div>
  );
};
