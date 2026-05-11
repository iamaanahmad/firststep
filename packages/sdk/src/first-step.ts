import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  AnalyticsEventType,
  FirstStepConfig,
  GuestSession,
  TransactionResult,
} from "./types.js";
import { GuestMode } from "./guest-mode.js";
import { WalletFactory, BaseWallet, PhantomWallet } from "./wallet.js";
import { SponsorshipTracker } from "./sponsor.js";
import { Analytics } from "./analytics.js";

const DEFAULT_SESSION_STORAGE_KEY = "fs_guest_session";
const DEFAULT_API_URL = "http://localhost:3001";
const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const SPONSOR_POOL_SEED = "sponsor_pool";
const USER_TRACKER_SEED = "user_tracker";

/**
 * FirstStep SDK - Main class for managing guest mode, wallets, and sponsorship
 */
export class FirstStepSDK {
  private config: FirstStepConfig;
  private connection: Connection;
  private guestMode: GuestMode;
  private sponsorshipTracker: SponsorshipTracker;
  private analytics: Analytics;
  private currentWallet: BaseWallet | null = null;
  private guestSession: GuestSession | null = null;
  private userId: string;
  private removePhantomListeners: (() => void) | null = null;

  constructor(config: FirstStepConfig) {
    this.config = {
      apiUrl: DEFAULT_API_URL,
      ...config,
      devnet: config.devnet !== false, // Default to devnet
    };

    // Initialize Solana connection
    const rpcUrl = this.config.devnet
      ? DEFAULT_RPC_URL
      : "https://api.mainnet-beta.solana.com";
    this.connection = new Connection(rpcUrl, "confirmed");

    // Initialize user ID (generate or retrieve from storage)
    this.userId = this._getOrCreateUserId();

    // Initialize guest mode
    this.guestMode = new GuestMode({
      maxTransactionsPerUser:
        config.sponsorPolicy?.maxTransactionsPerUser || 5,
      sessionStorageKey: DEFAULT_SESSION_STORAGE_KEY,
    });

    // Initialize sponsorship tracker
    this.sponsorshipTracker = new SponsorshipTracker(
      config.sponsorPolicy || {
        maxTransactionsPerUser: 5,
        maxSpendPerUser: 100000,
        maxSpendPerApp: 1000000,
      }
    );

    // Initialize analytics
    this.analytics = new Analytics({
      apiUrl: config.apiUrl || DEFAULT_API_URL,
      appId: config.appId,
    });
  }

  /**
   * Initialize guest mode session with ephemeral wallet
   */
  async initGuestMode(): Promise<GuestSession> {
    const { keypair, publicKey, sessionId } = this.guestMode.createSession();

    // Create custodial wallet for guest user
    this.currentWallet = WalletFactory.createCustodialWallet(
      keypair,
      this.connection
    );

    if (this.config.devnet) {
      await this._fundGuestWallet(publicKey);
    }

    this.guestSession = {
      publicKey: publicKey.toString(),
      isEphemeral: true,
      transactionCount: 0,
      createdAt: Date.now(),
    };

    // Track analytics
    await this.analytics.trackEvent("user_guest_mode", this.userId, {
      sessionId,
    });

    return this.guestSession;
  }

  /**
   * Check if transaction is eligible for sponsorship
   */
  async checkEligibleForSponsorship(userWalletAddress: string): Promise<boolean> {
    const onChainEligibility = await this._checkEligibilityOnChain(userWalletAddress);
    if (onChainEligibility !== null) {
      return onChainEligibility;
    }

    return this.sponsorshipTracker.checkEligibility(userWalletAddress);
  }

  /**
   * Send transaction with optional sponsorship
   */
  async sendTransaction(transaction: Transaction): Promise<TransactionResult> {
    if (!this.currentWallet) {
      return {
        signature: "",
        status: "failed",
        sponsored: false,
        error: "Wallet not initialized",
      };
    }

    try {
      // Check if user can perform transaction (guest mode limit)
      if (
        this.guestSession?.isEphemeral &&
        !this.guestMode.canPerformTransaction()
      ) {
        await this.analytics.trackEvent("tx_failed", this.userId, {
          reason: "guest_limit_reached",
        });
        return {
          signature: "",
          status: "failed",
          sponsored: false,
          error: "Guest transaction limit reached",
        };
      }

      const sponsorIdentity = this.currentWallet.publicKey.toString();

      // Check sponsorship eligibility before signing and sending.
      const isSponsored = await this.checkEligibleForSponsorship(sponsorIdentity);

      await this.analytics.trackEvent("tx_sign", this.userId, {
        guestMode: this.guestSession?.isEphemeral || false,
      });

      // Sign and send transaction
      const signature = await this.currentWallet.sendTransaction(
        transaction,
        this.connection
      );

      await this.analytics.trackEvent("tx_sent", this.userId, {
        signature,
      });

      await this.analytics.trackEvent("tx_success", this.userId, {
        signature,
      });

      if (isSponsored) {
        // Track sponsored transaction (in production, verify on-chain first)
        this.sponsorshipTracker.trackSponsoredTransaction(
          sponsorIdentity,
          5000, // TODO: Calculate actual transaction fee
          signature
        );

        await this.analytics.trackEvent("tx_sponsored", this.userId, {
          signature,
          amount: 5000,
        });
      }

      // Increment guest transaction counter
      if (this.guestSession?.isEphemeral) {
        this.guestMode.incrementTransactionCount();
      }

      return {
        signature,
        status: "success",
        sponsored: isSponsored,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.analytics.trackEvent("tx_failed", this.userId, {
        error: errorMessage,
      });

      return {
        signature: "",
        status: "failed",
        sponsored: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send sponsored transaction (alias for sendTransaction)
   */
  async sendSponsoredTransaction(
    _userPublicKey: string,
    transaction: Transaction
  ): Promise<TransactionResult> {
    return this.sendTransaction(transaction);
  }

  /**
   * Get current guest session
   */
  getGuestSession(): GuestSession | null {
    return this.guestSession;
  }

  /**
   * Get remaining guest transactions
   */
  getGuestTransactionsRemaining(): number {
    return this.guestMode.getRemainingTransactions();
  }

  /**
   * Get sponsorship budget for current user
   */
  getSponsorshipBudget(): {
    transactionsRemaining: number;
    spendRemaining: number;
  } {
    const identity = this.currentWallet?.publicKey.toString() || this.userId;
    return this.sponsorshipTracker.getRemainingBudget(identity);
  }

  /**
   * Upgrade from guest to full wallet
   */
  async upgradeToWallet(externalWallet: BaseWallet): Promise<void> {
    this._clearPhantomListeners();
    this.currentWallet = externalWallet;
    this.guestSession = null;
    this.guestMode.clearSession();

    if (externalWallet instanceof PhantomWallet) {
      this._registerPhantomListeners();
    }

    await this.analytics.trackEvent("wallet_connect", this.userId);
    await this.analytics.trackEvent("user_upgraded", this.userId);
  }

  /**
   * Connect Phantom and switch from guest session to external wallet mode.
   */
  async connectPhantomWallet(): Promise<{ publicKey: string }> {
    const phantomWallet: PhantomWallet = await WalletFactory.createPhantomWallet();
    await this.upgradeToWallet(phantomWallet);

    return {
      publicKey: phantomWallet.publicKey.toString(),
    };
  }

  /**
   * Restore a previously trusted Phantom session without showing connect modal.
   */
  async reconnectTrustedWallet(): Promise<{ connected: boolean; publicKey?: string }> {
    try {
      const phantomWallet = await WalletFactory.createPhantomWallet({
        onlyIfTrusted: true,
      });

      this._clearPhantomListeners();
      this.currentWallet = phantomWallet;
      this.guestSession = null;
      this.guestMode.clearSession();
      this._registerPhantomListeners();

      await this.analytics.trackEvent("wallet_connect", this.userId, {
        restoredSession: true,
      });

      return {
        connected: true,
        publicKey: phantomWallet.publicKey.toString(),
      };
    } catch {
      return { connected: false };
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.currentWallet instanceof PhantomWallet) {
      await this.currentWallet.disconnect();
    }

    this._clearPhantomListeners();
    this.currentWallet = null;

    await this.analytics.trackEvent("wallet_disconnect", this.userId);
  }

  /**
   * Track a custom funnel analytics event from the host app.
   */
  async trackEvent(
    type: AnalyticsEventType,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.analytics.trackEvent(type, this.userId, metadata);
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): BaseWallet | null {
    return this.currentWallet;
  }

  /**
   * Flush pending analytics events
   */
  async flushAnalytics(): Promise<void> {
    await this.analytics.forceFlush();
  }

  /**
   * Get SDK statistics
   */
  getStats(): {
    userId: string;
    isGuest: boolean;
    transactionsRemaining: number;
    sponsorshipStats: any;
  } {
    return {
      userId: this.userId,
      isGuest: this.guestSession?.isEphemeral || false,
      transactionsRemaining: this.getGuestTransactionsRemaining(),
      sponsorshipStats: this.sponsorshipTracker.getStats(),
    };
  }

  private _getOrCreateUserId(): string {
    if (typeof window !== "undefined" && window.localStorage) {
      let userId = window.localStorage.getItem("fs_user_id");
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        window.localStorage.setItem("fs_user_id", userId);
      }
      return userId;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private _registerPhantomListeners(): void {
    const provider = WalletFactory.getPhantomProvider();
    if (!provider?.on) {
      return;
    }

    const handleDisconnect = (): void => {
      this._clearPhantomListeners();
      this.currentWallet = null;
      void this.analytics.trackEvent("wallet_disconnect", this.userId, {
        source: "provider_event",
      });
    };

    const handleAccountChanged = (publicKey?: PublicKey | null): void => {
      if (!publicKey) {
        handleDisconnect();
        return;
      }

      this.currentWallet = new PhantomWallet(provider);
    };

    provider.on("disconnect", handleDisconnect);
    provider.on("accountChanged", handleAccountChanged);

    this.removePhantomListeners = () => {
      provider.off?.("disconnect", handleDisconnect);
      provider.off?.("accountChanged", handleAccountChanged);
      this.removePhantomListeners = null;
    };
  }

  private _clearPhantomListeners(): void {
    if (!this.removePhantomListeners) {
      return;
    }

    this.removePhantomListeners();
  }

  private async _checkEligibilityOnChain(
    userWalletAddress: string
  ): Promise<boolean | null> {
    if (!this.config.sponsorProgramId) {
      return null;
    }

    try {
      const programId = new PublicKey(this.config.sponsorProgramId);
      const seedEncoder = new TextEncoder();

      const [poolPda] = PublicKey.findProgramAddressSync(
        [seedEncoder.encode(SPONSOR_POOL_SEED)],
        programId
      );

      const poolAccount = await this.connection.getAccountInfo(poolPda, "confirmed");
      if (!poolAccount || poolAccount.data.length < 81) {
        return null;
      }

      const maxTransactionsPerUser = this._readU64LE(poolAccount.data, 40);
      const maxSpendPerUser = this._readU64LE(poolAccount.data, 48);
      const maxSpendPerApp = this._readU64LE(poolAccount.data, 56);
      const poolTotalSpend = this._readU64LE(poolAccount.data, 64);

      if (poolTotalSpend >= maxSpendPerApp) {
        return false;
      }

      const userPublicKey = new PublicKey(userWalletAddress);
      const [userTrackerPda] = PublicKey.findProgramAddressSync(
        [
          seedEncoder.encode(USER_TRACKER_SEED),
          userPublicKey.toBytes(),
          poolPda.toBytes(),
        ],
        programId
      );

      const userTrackerAccount = await this.connection.getAccountInfo(
        userTrackerPda,
        "confirmed"
      );

      // First sponsored transaction for this wallet.
      if (!userTrackerAccount) {
        return true;
      }

      if (userTrackerAccount.data.length < 89) {
        return null;
      }

      const userTransactionCount = this._readU64LE(userTrackerAccount.data, 72);
      const userTotalSpend = this._readU64LE(userTrackerAccount.data, 80);

      return (
        userTransactionCount < maxTransactionsPerUser &&
        userTotalSpend < maxSpendPerUser &&
        poolTotalSpend < maxSpendPerApp
      );
    } catch (error) {
      console.warn("Failed to query on-chain sponsorship eligibility:", error);
      return null;
    }
  }

  private _readU64LE(data: Uint8Array, offset: number): number {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return Number(view.getBigUint64(offset, true));
  }

  private async _fundGuestWallet(publicKey: PublicKey): Promise<void> {
    try {
      const airdropSignature = await this.connection.requestAirdrop(
        publicKey,
        Math.floor(0.1 * LAMPORTS_PER_SOL)
      );
      const latestBlockhash = await this.connection.getLatestBlockhash("confirmed");
      await this.connection.confirmTransaction(
        {
          signature: airdropSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );
    } catch (error) {
      console.warn("Failed to fund guest wallet on devnet:", error);
    }
  }
}
