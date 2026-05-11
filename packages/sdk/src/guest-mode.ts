import { Keypair, PublicKey } from "@solana/web3.js";

export interface GuestModeConfig {
  maxTransactionsPerUser: number;
  sessionStorageKey: string;
}

export class GuestMode {
  private maxTransactions: number;
  private sessionStorageKey: string;

  constructor(config: GuestModeConfig) {
    this.maxTransactions = config.maxTransactionsPerUser;
    this.sessionStorageKey = config.sessionStorageKey;
  }

  /**
   * Create a new guest session with ephemeral keypair
   */
  createSession(): {
    keypair: Keypair;
    publicKey: PublicKey;
    sessionId: string;
  } {
    const keypair = Keypair.generate();
    const sessionId = this._generateSessionId();

    // Store session in sessionStorage if available (browser environment)
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(
        this.sessionStorageKey,
        JSON.stringify({
          sessionId,
          publicKey: keypair.publicKey.toString(),
          createdAt: Date.now(),
          transactionCount: 0,
        })
      );
    }

    return {
      keypair,
      publicKey: keypair.publicKey,
      sessionId,
    };
  }

  /**
   * Retrieve existing guest session from sessionStorage
   */
  getSession(): {
    sessionId: string;
    publicKey: string;
    transactionCount: number;
  } | null {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return null;
    }

    const sessionData = window.sessionStorage.getItem(this.sessionStorageKey);
    if (!sessionData) return null;

    try {
      return JSON.parse(sessionData);
    } catch (e) {
      console.error("Failed to parse guest session:", e);
      return null;
    }
  }

  /**
   * Check if guest user can perform another transaction
   */
  canPerformTransaction(): boolean {
    const session = this.getSession();
    if (!session) return false;
    return session.transactionCount < this.maxTransactions;
  }

  /**
   * Increment transaction counter
   */
  incrementTransactionCount(): void {
    const session = this.getSession();
    if (!session) return;

    if (typeof window !== "undefined" && window.sessionStorage) {
      const updated = {
        ...session,
        transactionCount: session.transactionCount + 1,
      };
      window.sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(updated));
    }
  }

  /**
   * Get remaining transactions for guest user
   */
  getRemainingTransactions(): number {
    const session = this.getSession();
    if (!session) return 0;
    return Math.max(0, this.maxTransactions - session.transactionCount);
  }

  /**
   * Clear guest session
   */
  clearSession(): void {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(this.sessionStorageKey);
    }
  }

  private _generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
