# @firststep-solana/react

React hooks and components for FirstStep SDK integration.

## Features

- `useFirstStep()` hook for easy SDK integration
- Pre-built UI components (GuestModeBanner, UpgradeModal, etc.)
- Automatic guest/full wallet state management

## Installation

```bash
pnpm add @firststep-solana/react
```

## Usage

```typescript
import { useFirstStep } from "@firststep-solana/react";

function MyApp() {
  const { isGuest, sendTransaction } = useFirstStep({
    appId: "my-app",
  });

  const handleAction = async () => {
    const result = await sendTransaction(myTransaction);
  };

  return (
    <div>
      {isGuest && <p>You're in preview mode</p>}
      <button onClick={handleAction}>Do Something</button>
    </div>
  );
}
```
