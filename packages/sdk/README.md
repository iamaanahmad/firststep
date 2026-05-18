# @firststep-solana/sdk

Core SDK library for FirstStep onboarding platform.

## Features

- **Guest Mode**: Ephemeral wallets for users to try apps without connecting
- **Wallet Upgrade Path**: Phantom wallet connection for guest-to-full-user conversion
- **Transaction Sponsorship**: Tracks and sponsors first N transactions per user
- **Analytics**: Emits events for funnel tracking (drop-off analysis)

## Installation

```bash
pnpm add @firststep-solana/sdk
```

## Usage

```typescript
import { FirstStepSDK } from "@firststep-solana/sdk";

const sdk = new FirstStepSDK({
  appId: "my-app",
  sponsorPolicy: {
    maxTransactionsPerUser: 5,
    maxSpendPerUser: 100000,
  },
});

// Initialize guest mode
const guestSession = sdk.initGuestMode();

// Check sponsorship eligibility
const eligible = await sdk.checkEligibleForSponsorship(publicKey);

// Send sponsored transaction
const result = await sdk.sendSponsoredTransaction(publicKey, tx);
```

## API

See `src/types.ts` for full TypeScript interfaces.
