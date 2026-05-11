# FirstStep

**Onboarding & Gas Sponsorship SDK for Solana dApps**

FirstStep is a plug-and-play SDK that gives any Solana dApp guest mode, embedded wallets, sponsored first transactions, and a metrics dashboard to track user onboarding drop-off.

> **Status**: Hackathon MVP (Devnet-ready)  
> **Last Updated**: April 2026  
> **Documentation**: See [plan.txt](plan.txt) for full product spec

## The Problem

~70% of new users drop off at the "Connect Wallet" step before experiencing any value in a web3 app. Gas fees are confusing and feel unfair to non-crypto users, creating an extra barrier to entry.

## The Solution

FirstStep removes friction with:

- **Guest Mode** — Try the app without a wallet (limited to N free transactions)
- **Sponsored Transactions** — First transactions are free
- **Embedded Wallets** — Email/social login wallets (MVP: devnet custodial keypairs)
- **Analytics Dashboard** — See exactly where users drop off and why

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- For contract deployment: Rust + Anchor CLI
- For Solana devnet: Devnet SOL (get from faucet)

### Installation & Running

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run demo dApp (http://localhost:3000)
pnpm dev --filter demo

# In another terminal: Run dashboard (http://localhost:3001)
pnpm dev --filter @firststep/dashboard
```

## Project Structure

```
FirstStep/
├── packages/
│   ├── sdk/              # Core SDK (guest mode, sponsorship, analytics)
│   ├── react/            # React hook & UI components
│   └── dashboard/        # Next.js analytics dashboard (port 3001)
├── programs/
│   └── sponsorship/      # Anchor program (devnet sponsorship contract)
├── demo/                 # Sample dApp (NFT minting, port 3000)
├── plan.txt              # Product specification
└── .env.example          # Environment variables template
```

## SDK Usage

### Basic Setup

```typescript
import { useFirstStep } from "@firststep/react";
import { GuestModeBanner, GasSponsoredBadge } from "@firststep/react";
import { Transaction } from "@solana/web3.js";

export function MyApp() {
  const {
    isGuest,
    sendTransaction,
    transactionsRemaining,
    initGuest,
    upgradeFromGuest,
  } = useFirstStep({
    appId: "my-app",
    sponsorPolicy: {
      maxTransactionsPerUser: 5,
      maxSpendPerUser: 100000,
      maxSpendPerApp: 1000000,
    },
  });

  const handleFeature = async () => {
    const tx = new Transaction();
    // Build your transaction
    const result = await sendTransaction(tx);
    console.log(`Tx ${result.signature}, sponsored: ${result.sponsored}`);
  };

  return (
    <>
      {isGuest && (
        <GuestModeBanner
          transactionsRemaining={transactionsRemaining}
          onUpgrade={upgradeFromGuest}
        />
      )}

      <button onClick={initGuest}>Try as Guest</button>
      <button onClick={handleFeature} disabled={!isGuest && transactionsRemaining === 0}>
        Do Something
      </button>

      {isGuest && <GasSponsoredBadge sponsored={true} />}
    </>
  );
}
```

### Hook API

The `useFirstStep()` hook returns:

```typescript
{
  isGuest: boolean;                        // User in guest mode?
  isPending: boolean;                      // Transaction in flight?
  sdk: FirstStepSDK | null;                // Raw SDK instance
  guestSession: GuestSession | null;       // Current guest session
  transactionsRemaining: number;           // Txs left for guest
  sendTransaction: (tx) => Promise<...>;   // Send a transaction
  upgradeFromGuest: () => void;            // Upgrade to wallet
  initGuest: () => Promise<void>;          // Start guest mode
  stats: {...};                            // SDK statistics
}
```

## Components

### GuestModeBanner

Shows guest mode status and remaining transactions.

```typescript
<GuestModeBanner
  transactionsRemaining={5}
  onUpgrade={() => connectWallet()}
/>
```

### GasSponsoredBadge

Displays when a transaction is sponsored.

```typescript
<GasSponsoredBadge sponsored={true} cost={5000} />
```

### UpgradeModal

Prompts user to connect wallet when guest limit reached.

```typescript
<UpgradeModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onUpgrade={() => connectWallet()}
/>
```

## Analytics Events

The SDK automatically tracks:

| Event | Meaning |
|-------|---------|
| `user_guest_mode` | User started guest mode |
| `user_upgraded` | User connected full wallet |
| `tx_sent` | Transaction submitted |
| `tx_sponsored` | Transaction was sponsored |
| `tx_failed` | Transaction failed |

Events are batched and POSTed to `{DASHBOARD_URL}/api/events`.

## Dashboard

Open `http://localhost:3001` to view:

- **Total Users & Conversion Rate** — Guests → upgrades
- **Onboarding Funnel** — Drop-off at each step
- **Sponsored Transactions** — Count & cost
- **Real-time Metrics** — Auto-refresh every 5s

## Sponsorship Contract (Anchor)

Located in `programs/sponsorship/`. Handles:

- `initialize_sponsor_pool` — Set up app sponsorship limits
- `track_sponsored_transaction` — Record user transaction
- `check_eligibility` — Verify user can be sponsored

### Deploy to Devnet

```bash
cd programs/sponsorship
anchor build
anchor deploy --provider.cluster devnet
```

## Environment Variables

Create `.env.local` in `demo/` and `packages/dashboard/`:

```bash
# General
NEXT_PUBLIC_APP_ID=demo-app-001
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Sponsorship Limits
SPONSORSHIP_MAX_TX_PER_USER=5
SPONSORSHIP_MAX_SPEND_PER_USER=100000
SPONSORSHIP_MAX_SPEND_PER_APP=1000000
```

See [.env.example](.env.example) for full options.

## What's Included (MVP)

✅ Guest mode with ephemeral keypairs  
✅ Client-side sponsorship eligibility tracking  
✅ React hook + UI components  
✅ Demo dApp (NFT minting)  
✅ Metrics dashboard with funnel visualization  
✅ Devnet Anchor program  
✅ Event batching & analytics delivery  
✅ Transaction sponsorship badge  

## What's Coming (Post-MVP)

- [ ] Real embedded wallet integrations (Phantom, Magic, Privy)
- [ ] Mainnet sponsorship with treasury management
- [ ] User identity & persistent profiles
- [ ] Advanced analytics (cohorts, retention, LTV)
- [ ] Admin dashboard for sponsorship management
- [ ] Webhook support for custom events
- [ ] Database persistence (replace in-memory store)

## Development

### Build

```bash
pnpm build                    # All packages
pnpm build --filter @firststep/sdk  # Specific package
```

### Test

```bash
pnpm test
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

## Deployment

### Demo & Dashboard to Vercel

```bash
cd demo
vercel deploy

cd packages/dashboard
vercel deploy
```

### Sponsorship Contract to Devnet

```bash
cd programs/sponsorship
anchor deploy --provider.cluster devnet
```

## Architecture

### User Flow

1. User lands on dApp
2. SDK initializes guest mode (ephemeral keypair stored in sessionStorage)
3. User tries app features (limited to 5 transactions)
4. SDK tracks events → dashboard backend (`/api/events`)
5. User upgrades to full wallet anytime (or after limit reached)

### Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **SDK**: TypeScript, @solana/web3.js
- **Contract**: Anchor, Rust
- **Dashboard**: Next.js API routes (in-memory store, MVP)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style
- Submitting changes
- Testing guidelines

## Questions & Support

1. **Product Spec**: See [plan.txt](plan.txt)
2. **Development**: See [AGENTS.md](AGENTS.md)
3. **Package Docs**: Check individual `README.md` in each package
4. **Issues**: Open a GitHub issue

## License

MIT

---

**Built for Solana hackathons. Ship onboarding that doesn't suck.**
