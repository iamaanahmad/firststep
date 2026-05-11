"use client";

import React, { useState } from "react";
import { UseFirstStepReturn } from "@firststep/react";
import {
  GuestModeBanner,
  GasSponsoredBadge,
  UpgradeModal,
} from "@firststep/react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  ArrowRight,
  CheckCircle2,
  Gem,
  Layers3,
  Sparkles,
  Wallet,
} from "lucide-react";

interface AppPageProps {
  firstStep: UseFirstStepReturn;
}

export default function AppPage({ firstStep }: AppPageProps) {
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const nftCards = [
    {
      id: 1,
      title: "Aurora Drift",
      subtitle: "A minted collectible for onboarding demos.",
      accent: "linear-gradient(135deg, #22c55e, #0ea5e9)",
    },
    {
      id: 2,
      title: "Glass Relay",
      subtitle: "Gas-sponsored actions with one click.",
      accent: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
    },
    {
      id: 3,
      title: "Signal Mint",
      subtitle: "Track onboarding conversion in real time.",
      accent: "linear-gradient(135deg, #f59e0b, #ef4444)",
    },
  ];

  const handleMintNFT = async () => {
    if (firstStep.transactionsRemaining === 0) {
      setShowUpgradeModal(true);
      return;
    }

    await firstStep.trackEvent("action_initiated", {
      action: "mint_nft",
      screen: "app",
    });

    // Create a dummy transaction (in real app, this would be actual NFT mint)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(
          firstStep.walletPublicKey || firstStep.guestSession?.publicKey || ""
        ),
        toPubkey: new PublicKey("11111111111111111111111111111111"),
        lamports: 1000,
      })
    );

    const result = await firstStep.sendTransaction(transaction);

    setTransactionHistory((prev) => [
      {
        signature: result.signature,
        type: "NFT Mint",
        status: result.status,
        sponsored: result.sponsored,
        timestamp: new Date(),
      },
      ...prev,
    ]);

    if (firstStep.transactionsRemaining === 0) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 20px 40px",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
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
                background: "rgba(148, 163, 184, 0.14)",
                color: "#cbd5e1",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                marginBottom: "12px",
              }}
            >
              <Sparkles size={14} />
              FirstStep demo application
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              NFT minting without the wallet friction.
            </h1>
            <p style={{ margin: "12px 0 0", color: "#94a3b8", maxWidth: "64ch" }}>
              The demo shows the actual guest journey, sponsored transactions,
              and upgrade flow that the SDK enables for Solana apps.
            </p>
          </div>

          {(firstStep.guestSession || firstStep.walletPublicKey) && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                background: "rgba(15, 23, 42, 0.58)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                color: "#cbd5e1",
                minWidth: "240px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Wallet size={15} />
                <strong>{firstStep.isGuest ? "Guest wallet" : "Connected wallet"}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>
                {(firstStep.walletPublicKey || firstStep.guestSession?.publicKey || "").slice(0, 8)}...
              </div>
              {firstStep.isGuest ? (
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                  {firstStep.transactionsRemaining} free transactions remaining
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "6px",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6ee7b7" }}>Phantom connected</div>
                  <button
                    onClick={() => {
                      void firstStep.disconnectWallet();
                    }}
                    style={{
                      padding: "5px 8px",
                      borderRadius: "10px",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      background: "rgba(15, 23, 42, 0.58)",
                      color: "#e2e8f0",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {upgradeError && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "14px",
              color: "#fca5a5",
              background: "rgba(248, 113, 113, 0.14)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
            }}
          >
            Wallet connect failed: {upgradeError}
          </div>
        )}

        {firstStep.isGuest && (
          <div style={{ marginBottom: "18px" }}>
            <GuestModeBanner
              transactionsRemaining={firstStep.transactionsRemaining}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          {[
            {
              label: "Guest mode",
              value: firstStep.isGuest ? "Active" : "Off",
              note: firstStep.isGuest ? "Previewing with a session wallet" : "Full wallet connected",
              icon: Layers3,
            },
            {
              label: "Sponsored tx",
              value: `${firstStep.transactionsRemaining}`,
              note: "Free actions available before upgrade",
              icon: Gem,
            },
            {
              label: "Flow state",
              value: firstStep.isPending ? "Processing" : "Ready",
              note: "SDK and analytics are live",
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  padding: "18px",
                  borderRadius: "20px",
                  background: "rgba(15, 23, 42, 0.56)",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.24)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>{item.label}</div>
                  <Icon size={18} color="#67e8f9" />
                </div>
                <div style={{ fontSize: "2rem", fontFamily: "var(--font-space-grotesk)", color: "#f8fafc", marginTop: "10px" }}>
                  {item.value}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>{item.note}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.84), rgba(15, 23, 42, 0.62))",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: "28px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 32px 80px rgba(2, 6, 23, 0.34)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Mint your first NFT</h2>
              <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                Each action is sponsored while the user stays in preview mode.
              </p>
            </div>
            <div style={{ color: "#6ee7b7", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} />
              Sponsored: 0.1 SOL per mint
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {nftCards.map((card) => (
              <div
                key={card.id}
                style={{
                  borderRadius: "20px",
                  padding: "18px",
                  textAlign: "left",
                  background: "rgba(2, 6, 23, 0.42)",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "18px",
                    background: card.accent,
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <Gem size={34} strokeWidth={1.8} />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "18px" }}>
                    NFT #{card.id} - {card.title}
                  </div>
                  <p style={{ margin: "6px 0 0 0", color: "#94a3b8", lineHeight: 1.5 }}>
                    {card.subtitle}
                  </p>
                </div>
                <GasSponsoredBadge sponsored={firstStep.isGuest} cost={5000} />
              </div>
            ))}
          </div>

          <button
            onClick={handleMintNFT}
            disabled={firstStep.isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 22px",
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(59, 130, 246, 1))",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: firstStep.isPending ? "not-allowed" : "pointer",
              opacity: firstStep.isPending ? 0.7 : 1,
              boxShadow: "0 18px 40px rgba(34, 197, 94, 0.22)",
            }}
          >
            {firstStep.isPending ? "Processing..." : "Mint NFT #1"}
            {!firstStep.isPending && <ArrowRight size={16} />}
          </button>
        </div>

        {transactionHistory.length > 0 && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.62)",
              borderRadius: "28px",
              padding: "24px",
              boxShadow: "0 32px 80px rgba(2, 6, 23, 0.34)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Transaction history</h2>
            <div>
              {transactionHistory.map((tx, idx) => (
                <div
                  key={idx}
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid rgba(148, 163, 184, 0.12)",
                    paddingTop: idx === 0 ? 0 : "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>{tx.type}</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "4px",
                      }}
                    >
                      {tx.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        backgroundColor:
                          tx.status === "success"
                            ? "rgba(16, 185, 129, 0.14)"
                            : "rgba(248, 113, 113, 0.14)",
                        color: tx.status === "success" ? "#6ee7b7" : "#fca5a5",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {tx.status}
                    </div>
                    {tx.sponsored && (
                      <div style={{ marginTop: "6px" }}>
                        <GasSponsoredBadge sponsored={true} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={async () => {
            const result = await firstStep.upgradeFromGuest();
            if (!result.success) {
              setUpgradeError(result.error || "Unknown wallet connection error");
              return;
            }

            setUpgradeError(null);
            setShowUpgradeModal(false);
          }}
        />
      </div>
    </div>
  );
}
