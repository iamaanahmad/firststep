"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Zap, 
  ArrowDownRight, 
  TrendingUp,
  MousePointerClick,
  Wallet,
  CheckCircle
} from "lucide-react";

export default function AnalyticsDashboard() {
  const funnelSteps = [
    { name: "Landing Page", users: 1250, dropoff: "0%", color: "#6366f1", icon: Users },
    { name: "Try Demo Click", users: 840, dropoff: "32.8%", color: "#8b5cf6", icon: MousePointerClick },
    { name: "Guest Session", users: 620, dropoff: "26.1%", color: "#a855f7", icon: Zap },
    { name: "First Transaction", users: 410, dropoff: "33.8%", color: "#d946ef", icon: Wallet },
    { name: "Wallet Upgrade", users: 185, dropoff: "54.8%", color: "#ec4899", icon: CheckCircle },
  ];

  return (
    <div style={{ color: "#f8fafc" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px" }}>Onboarding Funnel</h2>
        <p style={{ color: "#94a3b8", margin: 0 }}>Track how your users progress from guests to full wallet owners.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {[
          { label: "Conversion Rate", value: "14.8%", trend: "+2.4%", icon: TrendingUp, color: "#10b981" },
          { label: "Active Guests", value: "1,240", trend: "+12%", icon: Users, color: "#3b82f6" },
          { label: "Sponsored Fees", value: "4.2 SOL", trend: "-5%", icon: Zap, color: "#f59e0b" },
          { label: "Drop-off Reduced", value: "22%", trend: "+8%", icon: ArrowDownRight, color: "#ef4444" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: "24px",
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${stat.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: stat.trend.startsWith("+") ? "#10b981" : "#ef4444" }}>{stat.trend}</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{stat.value}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ position: "relative", padding: "20px 0" }}>
        {funnelSteps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${(step.users / funnelSteps[0].users) * 100}%`, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
            style={{
              height: "60px",
              marginBottom: "12px",
              background: `linear-gradient(90deg, ${step.color} 0%, ${step.color}80 100%)`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${step.color}40`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
              <step.icon size={20} />
              <span style={{ fontWeight: 700 }}>{step.name}</span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{step.users}</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>users</div>
              </div>
              {i > 0 && (
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                  -{step.dropoff} drop-off
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Connection lines or arrows could go here */}
      </div>

      <div style={{ marginTop: "40px", padding: "24px", borderRadius: "20px", background: "rgba(139, 92, 246, 0.1)", border: "1.5px dashed rgba(139, 92, 246, 0.3)" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.2)" }}>
            <BarChart3 size={24} color="#a855f7" />
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>AI Recommendation</h4>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
              Most users (54.8%) drop off during the <strong>Wallet Upgrade</strong> step. Consider extending the "Sponsored Transaction" limit from 3 to 5 to build more trust before asking for a wallet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
