import { SponsorshipPolicy } from "./types.js";

export interface SponsortrackerState {
  userSpends: Map<string, number>;
  userTransactionCounts: Map<string, number>;
  appTotalSpend: number;
  trackedTransactions: Set<string>;
}

/**
 * Sponsorship tracking and eligibility checking
 * In production, this would query an on-chain Anchor program
 */
export class SponsorshipTracker {
  private policy: SponsorshipPolicy;
  private state: SponsortrackerState;

  constructor(policy: SponsorshipPolicy) {
    this.policy = policy;
    this.state = {
      userSpends: new Map(),
      userTransactionCounts: new Map(),
      appTotalSpend: 0,
      trackedTransactions: new Set(),
    };
  }

  /**
   * Check if a user is eligible for transaction sponsorship
   */
  checkEligibility(userId: string): boolean {
    // Check transaction count limit
    const txCount = this.state.userTransactionCounts.get(userId) || 0;
    if (txCount >= this.policy.maxTransactionsPerUser) {
      return false;
    }

    // Check user spend limit
    const userSpend = this.state.userSpends.get(userId) || 0;
    if (userSpend >= this.policy.maxSpendPerUser) {
      return false;
    }

    // Check app total spend limit
    if (this.state.appTotalSpend >= this.policy.maxSpendPerApp) {
      return false;
    }

    return true;
  }

  /**
   * Track a sponsored transaction
   * In production, this would be called after on-chain verification
   */
  trackSponsoredTransaction(userId: string, amount: number, txSig: string): void {
    // Increment user transaction count
    const currentCount = this.state.userTransactionCounts.get(userId) || 0;
    this.state.userTransactionCounts.set(userId, currentCount + 1);

    // Track user spend
    const currentSpend = this.state.userSpends.get(userId) || 0;
    this.state.userSpends.set(userId, currentSpend + amount);

    // Track app total spend
    this.state.appTotalSpend += amount;

    // Track this transaction
    this.state.trackedTransactions.add(txSig);

    console.log(`Tracked sponsored tx for ${userId}: ${txSig} (${amount} lamports)`);
  }

  /**
   * Get remaining sponsorship budget for a user
   */
  getRemainingBudget(userId: string): {
    transactionsRemaining: number;
    spendRemaining: number;
  } {
    const txCount = this.state.userTransactionCounts.get(userId) || 0;
    const userSpend = this.state.userSpends.get(userId) || 0;

    return {
      transactionsRemaining: Math.max(
        0,
        this.policy.maxTransactionsPerUser - txCount
      ),
      spendRemaining: Math.max(0, this.policy.maxSpendPerUser - userSpend),
    };
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalUsersSponsored: number;
    totalTransactionsSponsored: number;
    totalSpend: number;
  } {
    return {
      totalUsersSponsored: this.state.userTransactionCounts.size,
      totalTransactionsSponsored: Array.from(
        this.state.userTransactionCounts.values()
      ).reduce((a, b) => a + b, 0),
      totalSpend: this.state.appTotalSpend,
    };
  }

  /**
   * Reset tracker (for testing or new app session)
   */
  reset(): void {
    this.state = {
      userSpends: new Map(),
      userTransactionCounts: new Map(),
      appTotalSpend: 0,
      trackedTransactions: new Set(),
    };
  }
}
