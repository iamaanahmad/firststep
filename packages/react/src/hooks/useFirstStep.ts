import { useEffect, useState, useCallback } from "react";
import {
  AnalyticsEventType,
  FirstStepSDK,
  FirstStepConfig,
  TransactionResult,
  GuestSession,
} from "@firststep/sdk";
import { Transaction } from "@solana/web3.js";

export interface UseFirstStepReturn {
  isGuest: boolean;
  walletPublicKey: string | null;
  isPending: boolean;
  sdk: FirstStepSDK | null;
  guestSession: GuestSession | null;
  transactionsRemaining: number;
  sendTransaction: (transaction: Transaction) => Promise<TransactionResult>;
  upgradeFromGuest: () => Promise<{ success: boolean; error?: string }>;
  disconnectWallet: () => Promise<void>;
  initGuest: () => Promise<void>;
  trackEvent: (
    type: AnalyticsEventType,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  stats: any;
}

/**
 * React hook for FirstStep SDK integration
 * Provides guest mode, sponsorship tracking, and analytics
 */
export function useFirstStep(config: FirstStepConfig): UseFirstStepReturn {
  const [sdk, setSdk] = useState<FirstStepSDK | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [transactionsRemaining, setTransactionsRemaining] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Initialize SDK on mount
  useEffect(() => {
    try {
      const newSdk = new FirstStepSDK(config);
      setSdk(newSdk);
    } catch (error) {
      console.error("Failed to initialize FirstStep SDK:", error);
    }
  }, [config.appId]); // Re-init only if appId changes

  // Restore trusted Phantom session if already approved by the user.
  useEffect(() => {
    if (!sdk) return;

    let cancelled = false;

    const restoreTrustedSession = async () => {
      const result = await sdk.reconnectTrustedWallet();
      if (cancelled || !result.connected) {
        return;
      }

      setWalletPublicKey(result.publicKey || null);
      setIsGuest(false);
      setGuestSession(null);
      setTransactionsRemaining(0);
      setStats(sdk.getStats());
      await sdk.flushAnalytics();
    };

    void restoreTrustedSession();

    return () => {
      cancelled = true;
    };
  }, [sdk]);

  // Initialize guest mode
  const initGuest = useCallback(async () => {
    if (!sdk) return;

    try {
      setIsPending(true);
      const session = await sdk.initGuestMode();
      setGuestSession(session);
      setIsGuest(true);
      setWalletPublicKey(null);
      setTransactionsRemaining(sdk.getGuestTransactionsRemaining());
    } catch (error) {
      console.error("Failed to initialize guest mode:", error);
    } finally {
      setIsPending(false);
    }
  }, [sdk]);

  // Send transaction
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<TransactionResult> => {
      if (!sdk) {
        return {
          signature: "",
          status: "failed",
          sponsored: false,
          error: "SDK not initialized",
        };
      }

      setIsPending(true);
      try {
        const result = await sdk.sendTransaction(transaction);

        // Update remaining transactions if guest mode
        if (isGuest) {
          setTransactionsRemaining(sdk.getGuestTransactionsRemaining());
        }

        // Update stats
        setStats(sdk.getStats());

        // Flush analytics
        await sdk.flushAnalytics();

        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          signature: "",
          status: "failed",
          sponsored: false,
          error: msg,
        };
      } finally {
        setIsPending(false);
      }
    },
    [sdk, isGuest]
  );

  // Upgrade from guest to full wallet
  const upgradeFromGuest = useCallback(() => {
    const connect = async (): Promise<{ success: boolean; error?: string }> => {
      if (!sdk) {
        return { success: false, error: "SDK not initialized" };
      }

      setIsPending(true);
      try {
        const result = await sdk.connectPhantomWallet();
        setWalletPublicKey(result.publicKey);
        setIsGuest(false);
        setGuestSession(null);
        setTransactionsRemaining(0);
        setStats(sdk.getStats());
        await sdk.flushAnalytics();

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      } finally {
        setIsPending(false);
      }
    };

    return connect();
  }, [sdk]);

  const trackEvent = useCallback(
    async (type: AnalyticsEventType, metadata?: Record<string, unknown>) => {
      if (!sdk) return;
      await sdk.trackEvent(type, metadata);
    },
    [sdk]
  );

  const disconnectWallet = useCallback(async () => {
    if (!sdk) return;

    setIsPending(true);
    try {
      await sdk.disconnectWallet();
      setWalletPublicKey(null);
      setIsGuest(false);
      setGuestSession(null);
      setTransactionsRemaining(0);
      setStats(sdk.getStats());
      await sdk.flushAnalytics();
    } finally {
      setIsPending(false);
    }
  }, [sdk]);

  return {
    isGuest,
    walletPublicKey,
    isPending,
    sdk,
    guestSession,
    transactionsRemaining,
    sendTransaction,
    upgradeFromGuest,
    disconnectWallet,
    initGuest,
    trackEvent,
    stats,
  };
}
