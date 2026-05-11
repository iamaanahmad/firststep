# FirstStep Sponsorship Program

Anchor program for managing transaction sponsorship on Solana.

## Features

- **Initialize Sponsorship Pool**: Set up sponsorship parameters per app
- **Track Sponsored Transactions**: Record user transactions against their quota
- **Eligibility Checking**: Verify users can perform sponsored transactions
- **Policy Updates**: Admin can modify sponsorship limits

## Program Instructions

### 1. `initialize_sponsor_pool`

Initialize a new sponsorship pool with limits:

```rust
pub fn initialize_sponsor_pool(
    ctx: Context<InitializeSponsor>,
    max_transactions_per_user: u64,
    max_spend_per_user: u64,
    max_spend_per_app: u64,
) -> Result<()>
```

**Parameters:**
- `max_transactions_per_user`: Max free transactions per user
- `max_spend_per_user`: Max SOL to sponsor per user
- `max_spend_per_app`: Total budget for app sponsorship

### 2. `track_sponsored_transaction`

Record a sponsored transaction for a user:

```rust
pub fn track_sponsored_transaction(
    ctx: Context<TrackTransaction>,
    amount: u64,
) -> Result<()>
```

Checks eligibility before recording. Returns error if limits exceeded.

### 3. `check_eligibility`

Check if user is eligible for sponsorship:

```rust
pub fn check_eligibility(ctx: Context<CheckEligibility>) -> Result<bool>
```

### 4. `update_policy` (Admin)

Modify sponsorship parameters:

```rust
pub fn update_policy(
    ctx: Context<UpdatePolicy>,
    max_transactions_per_user: u64,
    max_spend_per_user: u64,
    max_spend_per_app: u64,
) -> Result<()>
```

## Accounts

### SponsorshipPool

Stores pool-level configuration and stats:
- `authority`: Admin wallet
- `max_transactions_per_user`: Limit per user
- `max_spend_per_user`: Budget limit per user
- `max_spend_per_app`: Total budget
- `total_spend`: Cumulative spend
- `total_transactions_sponsored`: Count of transactions

### UserTracker (PDA)

Per-user sponsorship state (seeds: `["user_tracker", user_pubkey, pool_pubkey]`):
- `user`: User's public key
- `pool`: Associated pool
- `transaction_count`: Sponsored txs by user
- `total_spend`: Total SOL spent on user

## Build & Deploy

### Build

```bash
anchor build
```

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Run Tests

```bash
anchor test
```

## Integration with SDK

The SDK's `SponsorshipTracker` mirrors this on-chain logic for client-side validation. In production, SDK should call these program instructions before sending sponsored transactions.

## TODO

- [ ] Implement withdraw function for budget management
- [ ] Add PDA rent recovery mechanisms
- [ ] Create off-chain indexing for analytics
- [ ] Add rate limiting per IP/endpoint
- [ ] Implement program upgrade authority
