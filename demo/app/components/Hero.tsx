"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
  TrendingUp,
} from "lucide-react";

interface HeroProps {
  onTryAsGuest: () => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export default function Hero({ onTryAsGuest }: HeroProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px 20px 80px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 30%, rgba(139, 92, 246, 0.25) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Main container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header section */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <motion.img
            variants={itemVariants}
            src="/FirstStepLogo.png"
            alt="FirstStep Logo"
            style={{ height: "100px", marginBottom: "24px", filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))" }}
          />
          <br />
          <motion.div
            variants={itemVariants}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 24px",
              borderRadius: "999px",
              border: "1.5px solid rgba(139, 92, 246, 0.6)",
              background: "rgba(139, 92, 246, 0.15)",
              color: "#c084fc",
              marginBottom: "32px",
              backdropFilter: "blur(10px)",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            <Sparkles size={18} />
            The Future of Solana Onboarding
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: "clamp(2.8rem, 8vw, 4.8rem)",
              lineHeight: 1.15,
              margin: "0 0 24px",
              background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 900,
              maxWidth: "900px",
              marginLeft: "auto",
              marginRight: "auto",
              letterSpacing: "-0.02em",
            }}
          >
            Onboard users instantly. No wallet required.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: "1.3rem",
              lineHeight: 1.7,
              color: "#cbd5e1",
              margin: "0 0 48px",
              maxWidth: "750px",
              marginLeft: "auto",
              marginRight: "auto",
              fontWeight: 400,
              letterSpacing: "0.3px",
            }}
          >
            FirstStep gives your dApp everything needed for frictionless onboarding—guest mode, embedded wallets, sponsored transactions, and analytics that show exactly where users drop off.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05, translateY: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTryAsGuest}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 36px",
                fontSize: "16px",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                boxShadow: "0 20px 50px rgba(139, 92, 246, 0.35)",
                transition: "box-shadow 0.3s ease",
                letterSpacing: "0.5px",
              }}
            >
              <Rocket size={20} />
              Try Live Demo
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open("https://github.com/iamaanahmad/firststep", "_blank")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 36px",
                fontSize: "16px",
                fontWeight: 700,
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                color: "#e9d5ff",
                border: "1.5px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "14px",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "border-color 0.3s ease",
                letterSpacing: "0.5px",
              }}
            >
              <Wallet size={20} />
              View Docs
            </motion.button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "80px",
          }}
        >
          {[
            {
              icon: Zap,
              title: "Instant Setup",
              description: "Get guest mode working in minutes. No complex configuration needed.",
              color: "#f59e0b",
              bgColor: "rgba(245, 158, 11, 0.12)",
              borderColor: "rgba(245, 158, 11, 0.3)",
            },
            {
              icon: Coins,
              title: "Sponsored Gas",
              description: "Cover first transaction costs for users. Convert guests to paying users.",
              color: "#10b981",
              bgColor: "rgba(16, 185, 129, 0.12)",
              borderColor: "rgba(16, 185, 129, 0.3)",
            },
            {
              icon: TrendingUp,
              title: "Analytics Dashboard",
              description: "See exactly where users drop off in your onboarding flow.",
              color: "#3b82f6",
              bgColor: "rgba(59, 130, 246, 0.12)",
              borderColor: "rgba(59, 130, 246, 0.3)",
            },
            {
              icon: ShieldCheck,
              title: "Secure & Audited",
              description: "Production-ready with security best practices built-in.",
              color: "#ef4444",
              bgColor: "rgba(239, 68, 68, 0.12)",
              borderColor: "rgba(239, 68, 68, 0.3)",
            },
            {
              icon: BadgeCheck,
              title: "Upgrade Anytime",
              description: "Users upgrade to full wallets when they're ready.",
              color: "#8b5cf6",
              bgColor: "rgba(139, 92, 246, 0.12)",
              borderColor: "rgba(139, 92, 246, 0.3)",
            },
            {
              icon: Wallet,
              title: "Embedded Wallets",
              description: "Seamless wallet experience without leaving your app.",
              color: "#06b6d4",
              bgColor: "rgba(6, 182, 212, 0.12)",
              borderColor: "rgba(6, 182, 212, 0.3)",
            },
          ].map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10, boxShadow: `0 20px 40px ${feature.color}20`, borderColor: feature.borderColor.replace("0.3", "0.6") }}
                style={{
                  padding: "32px",
                  borderRadius: "16px",
                  border: `1.5px solid ${feature.borderColor}`,
                  background: feature.bgColor,
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${feature.color}20`,
                    marginBottom: "16px",
                  }}
                >
                  <IconComponent size={28} color={feature.color} />
                </div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: "0 0 12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: "#cbd5e1",
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Demo Section */}
        <motion.div
          variants={itemVariants}
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)",
            border: "1.5px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "24px",
            padding: "56px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(139, 92, 246, 0.15)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "56px",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2.8rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "0 0 20px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Experience the guest flow
              </h2>
              <p
                style={{
                  fontSize: "1.15rem",
                  lineHeight: 1.8,
                  color: "#cbd5e1",
                  margin: "0 0 36px",
                  letterSpacing: "0.3px",
                }}
              >
                Users get started instantly without a wallet, experience sponsored transactions, and upgrade when they're ready. Built with production-grade security and best practices.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {[
                  { icon: BadgeCheck, label: "No wallet setup required", color: "#8b5cf6" },
                  { icon: Coins, label: "First transactions sponsored", color: "#10b981" },
                  { icon: TrendingUp, label: "Real-time analytics", color: "#3b82f6" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      fontSize: "1.1rem",
                      color: "#e2e8f0",
                      fontWeight: 500,
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: `${item.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <item.icon size={22} color={item.color} />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ rotateY: 5, rotateX: 5 }}
              style={{
                perspective: "1000px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)",
                border: "1.5px solid rgba(139, 92, 246, 0.25)",
                borderRadius: "20px",
                padding: "36px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
                    LIVE DEMO
                  </div>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Guest Onboarding
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.2)",
                    color: "#d8b4fe",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  <Sparkles size={14} />
                  Live
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Step 1: Enter Email", value: "No wallet needed", status: "✓", statusColor: "#10b981" },
                  { label: "Step 2: Confirm Link", value: "Check your inbox", status: "✓", statusColor: "#10b981" },
                  { label: "Step 3: Start Using", value: "First 3-5 txs sponsored", status: "→", statusColor: "#8b5cf6" },
                ].map((step) => (
                  <motion.div
                    key={step.label}
                    whileHover={{ x: 10, backgroundColor: "rgba(139, 92, 246, 0.15)", borderColor: "rgba(139, 92, 246, 0.4)" }}
                    style={{
                      padding: "18px",
                      background: "rgba(139, 92, 246, 0.08)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: "16px", color: "#e2e8f0", fontWeight: 600, marginTop: "6px" }}>
                        {step.value}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "18px",
                        color: step.statusColor,
                        fontWeight: 700,
                      }}
                    >
                      {step.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
