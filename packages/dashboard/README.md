# @firststep-solana/dashboard

Analytics dashboard for FirstStep onboarding metrics.

## Features

- Funnel visualization (Landing → Feature → Wallet Connect → Tx Sign → Success)
- Drop-off analysis at each step
- Sponsored transaction tracking and cost analysis
- Guest-to-upgrade conversion metrics

## Development

```bash
pnpm dev
```

Runs on `http://localhost:3001`

## API Endpoints

- `POST /api/events` — Record analytics event
- `GET /api/metrics` — Retrieve aggregated metrics

## TODO

- [ ] Connect to real database (Convex, Supabase)
- [ ] Add real-time updates via WebSockets
- [ ] Implement funnel charts
- [ ] Add filtering by app/date range
