// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicKey, Transaction } from "@solana/web3.js";
import { FirstStepSDK } from "../src/first-step";
import { PhantomProvider } from "../src/wallet";

class MockPhantomProvider implements PhantomProvider {
  isPhantom = true;
  publicKey: PublicKey | null = null;
  isConnected = false;
  trusted = true;
  lastConnectOptions?: { onlyIfTrusted?: boolean };

  private handlers: Record<string, Array<(publicKey?: PublicKey | null) => void>> = {
    connect: [],
    disconnect: [],
    accountChanged: [],
  };

  async connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    this.lastConnectOptions = options;

    if (options?.onlyIfTrusted && !this.trusted) {
      throw new Error("Wallet not trusted");
    }

    this.publicKey = new PublicKey("H3zrxYbyN3C8Y9A8jQzG53jff9sU4LrLPVNf8ZW3R5Jf");
    this.isConnected = true;
    this.handlers.connect.forEach((handler) => handler(this.publicKey));

    return { publicKey: this.publicKey };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.publicKey = null;
    this.handlers.disconnect.forEach((handler) => handler(null));
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs;
  }

  on(
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PublicKey | null) => void
  ): void {
    this.handlers[event].push(handler);
  }

  off(
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PublicKey | null) => void
  ): void {
    this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
  }
}

describe("FirstStepSDK wallet lifecycle", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        statusText: "ok",
      })
    );

    window.localStorage.clear();
    window.sessionStorage.clear();
    delete window.solana;
  });

  it("upgrades from guest mode to Phantom wallet", async () => {
    const provider = new MockPhantomProvider();
    window.solana = provider;

    const sdk = new FirstStepSDK({ appId: "test-app" });
    await sdk.initGuestMode();

    const result = await sdk.connectPhantomWallet();

    expect(result.publicKey).toBe("H3zrxYbyN3C8Y9A8jQzG53jff9sU4LrLPVNf8ZW3R5Jf");
    expect(sdk.getGuestSession()).toBeNull();
    expect(sdk.getCurrentWallet()?.publicKey.toString()).toBe(result.publicKey);
  });

  it("restores trusted Phantom session without interactive connect", async () => {
    const provider = new MockPhantomProvider();
    window.solana = provider;

    const sdk = new FirstStepSDK({ appId: "test-app" });
    const restored = await sdk.reconnectTrustedWallet();

    expect(restored.connected).toBe(true);
    expect(provider.lastConnectOptions).toEqual({ onlyIfTrusted: true });
    expect(sdk.getCurrentWallet()?.publicKey.toString()).toBe(restored.publicKey);
  });

  it("clears active wallet when Phantom disconnect event fires", async () => {
    const provider = new MockPhantomProvider();
    window.solana = provider;

    const sdk = new FirstStepSDK({ appId: "test-app" });
    await sdk.connectPhantomWallet();

    await provider.disconnect();

    expect(sdk.getCurrentWallet()).toBeNull();
  });
});
