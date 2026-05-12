"use client";

import { useEffect, useState } from "react";
import { useFirstStep } from "@firststep/react";
import Hero from "./components/Hero";
import AppPage from "./components/AppPage";

export default function Home() {
  const [isInApp, setIsInApp] = useState(false);
  const firstStep = useFirstStep({
    appId: "demo-app-001",
    devnet: true,
    sponsorPolicy: {
      maxTransactionsPerUser: 5,
      maxSpendPerUser: 100000,
      maxSpendPerApp: 1000000,
    },
  });

  useEffect(() => {
    if (!firstStep.sdk) return;

    void firstStep.trackEvent("landing_view", {
      screen: "home",
    });
  }, [firstStep.sdk, firstStep.trackEvent]);

  const handleTryAsGuest = async () => {
    await firstStep.trackEvent("feature_click", {
      element: "try_live_demo",
      screen: "home",
    });
    await firstStep.initGuest();
    setIsInApp(true);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {!isInApp ? (
        <Hero onTryAsGuest={handleTryAsGuest} />
      ) : (
        <AppPage firstStep={firstStep} />
      )}
    </div>
  );
}
