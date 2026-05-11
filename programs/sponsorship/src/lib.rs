use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod firststep_sponsorship {
    use super::*;

    /**
     * Initialize a new sponsorship pool for an app
     */
    pub fn initialize_sponsor_pool(
        ctx: Context<InitializeSponsor>,
        max_transactions_per_user: u64,
        max_spend_per_user: u64,
        max_spend_per_app: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.max_transactions_per_user = max_transactions_per_user;
        pool.max_spend_per_user = max_spend_per_user;
        pool.max_spend_per_app = max_spend_per_app;
        pool.total_spend = 0;
        pool.total_transactions_sponsored = 0;
        pool.bump = ctx.bumps.pool;

        msg!(
            "Initialized sponsor pool: max_tx_per_user={}, max_spend_per_user={}, max_spend_per_app={}",
            max_transactions_per_user,
            max_spend_per_user,
            max_spend_per_app
        );

        Ok(())
    }

    /**
     * Track a sponsored transaction for a user
     */
    pub fn track_sponsored_transaction(
        ctx: Context<TrackTransaction>,
        amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_tracker = &mut ctx.accounts.user_tracker;

        // Verify we're within limits
        require!(
            user_tracker.transaction_count < pool.max_transactions_per_user,
            SponsorshipError::TransactionLimitExceeded
        );
        require!(
            user_tracker.total_spend + amount <= pool.max_spend_per_user,
            SponsorshipError::UserSpendLimitExceeded
        );
        require!(
            pool.total_spend + amount <= pool.max_spend_per_app,
            SponsorshipError::AppSpendLimitExceeded
        );

        // Update user tracker
        user_tracker.transaction_count += 1;
        user_tracker.total_spend += amount;

        // Update pool
        pool.total_spend += amount;
        pool.total_transactions_sponsored += 1;

        msg!(
            "Tracked sponsored transaction: user_tx_count={}, pool_total_spend={}",
            user_tracker.transaction_count,
            pool.total_spend
        );

        Ok(())
    }

    /**
     * Check if a user is eligible for sponsorship
     */
    pub fn check_eligibility(ctx: Context<CheckEligibility>) -> Result<bool> {
        let pool = &ctx.accounts.pool;
        let user_tracker = &ctx.accounts.user_tracker;

        let is_eligible = user_tracker.transaction_count < pool.max_transactions_per_user
            && user_tracker.total_spend < pool.max_spend_per_user
            && pool.total_spend < pool.max_spend_per_app;

        msg!("User eligibility check: {}", is_eligible);

        Ok(is_eligible)
    }

    /**
     * Admin: Update sponsorship policy
     */
    pub fn update_policy(
        ctx: Context<UpdatePolicy>,
        max_transactions_per_user: u64,
        max_spend_per_user: u64,
        max_spend_per_app: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        pool.max_transactions_per_user = max_transactions_per_user;
        pool.max_spend_per_user = max_spend_per_user;
        pool.max_spend_per_app = max_spend_per_app;

        msg!("Updated sponsorship policy");

        Ok(())
    }

    /**
     * Admin: Withdraw sponsorship budget
     */
    pub fn withdraw_budget(ctx: Context<WithdrawBudget>, amount: u64) -> Result<()> {
        let pool = &ctx.accounts.pool;
        require!(pool.total_spend >= amount, SponsorshipError::InsufficientBudget);

        // TODO: Transfer SOL from pool to authority wallet

        msg!("Withdrew {} lamports from budget", amount);

        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

/**
 * SponsorshipPool: Tracks overall sponsorship settings and stats
 */
#[account]
pub struct SponsorshipPool {
    pub authority: Pubkey,
    pub max_transactions_per_user: u64,
    pub max_spend_per_user: u64,
    pub max_spend_per_app: u64,
    pub total_spend: u64,
    pub total_transactions_sponsored: u64,
    pub bump: u8,
}

/**
 * UserTracker: Tracks per-user sponsorship usage
 */
#[account]
pub struct UserTracker {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub transaction_count: u64,
    pub total_spend: u64,
    pub bump: u8,
}

// ============================================================================
// CONTEXTS
// ============================================================================

#[derive(Accounts)]
#[instruction()]
pub struct InitializeSponsor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<SponsorshipPool>(),
        seeds = [b"sponsor_pool"],
        bump
    )]
    pub pool: Account<'info, SponsorshipPool>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct TrackTransaction<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, seeds = [b"sponsor_pool"], bump = pool.bump)]
    pub pool: Account<'info, SponsorshipPool>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + std::mem::size_of::<UserTracker>(),
        seeds = [b"user_tracker", payer.key().as_ref(), pool.key().as_ref()],
        bump
    )]
    pub user_tracker: Account<'info, UserTracker>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckEligibility<'info> {
    pub pool: Account<'info, SponsorshipPool>,

    pub user_tracker: Account<'info, UserTracker>,
}

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    pub authority: Signer<'info>,

    #[account(mut, seeds = [b"sponsor_pool"], bump = pool.bump, has_one = authority)]
    pub pool: Account<'info, SponsorshipPool>,
}

#[derive(Accounts)]
pub struct WithdrawBudget<'info> {
    pub authority: Signer<'info>,

    #[account(mut, seeds = [b"sponsor_pool"], bump = pool.bump, has_one = authority)]
    pub pool: Account<'info, SponsorshipPool>,
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum SponsorshipError {
    #[msg("User has exceeded transaction limit")]
    TransactionLimitExceeded,

    #[msg("User has exceeded spend limit")]
    UserSpendLimitExceeded,

    #[msg("App has exceeded total spend limit")]
    AppSpendLimitExceeded,

    #[msg("Insufficient budget available")]
    InsufficientBudget,
}
