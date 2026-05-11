import {
  Transaction,
  PublicKey,
  Keypair,
  Connection,
  SendOptions,
} from "@solana/web3.js";

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  on?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PublicKey | null) => void
  ) => void;
  off?: (
    event: "connect" | "disconnect" | "accountChanged",
    handler: (publicKey?: PublicKey | null) => void
  ) => void;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: PublicKey;
  }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export interface WalletInterface {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  sendTransaction(
    tx: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string>;
}

/**
 * Base Wallet class - abstraction for different wallet types
 */
export abstract class BaseWallet {
  abstract get publicKey(): PublicKey;
  abstract signTransaction(tx: Transaction): Promise<Transaction>;
  abstract signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  abstract sendTransaction(
    tx: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string>;
}

/**
 * Custodial Wallet - for MVP guest mode (server holds key)
 * In production, this would be replaced with Phantom, Magic, Privy, etc.
 */
export class CustodialWallet extends BaseWallet {
  private _keypair: Keypair;

  constructor(keypair: Keypair, _connection: Connection) {
    super();
    this._keypair = keypair;
  }

  get publicKey(): PublicKey {
    return this._keypair.publicKey;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.sign(this._keypair);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((tx) => {
      tx.sign(this._keypair);
      return tx;
    });
  }

  async sendTransaction(
    tx: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    try {
      tx.feePayer = tx.feePayer || this._keypair.publicKey;

      if (!tx.recentBlockhash) {
        const latestBlockhash = await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = latestBlockhash.blockhash;
      }

      const signed = await this.signTransaction(tx);
      const serialized = signed.serialize();
      const signature = await connection.sendRawTransaction(serialized, options);

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");
      return signature;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }
}

/**
 * Phantom Wallet adapter for browser-based wallet connection.
 */
export class PhantomWallet extends BaseWallet {
  private provider: PhantomProvider;

  constructor(provider: PhantomProvider) {
    super();
    this.provider = provider;
  }

  get publicKey(): PublicKey {
    if (!this.provider.publicKey) {
      throw new Error("Phantom wallet is not connected");
    }

    return this.provider.publicKey;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    return this.provider.signTransaction(tx);
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return this.provider.signAllTransactions(txs);
  }

  async sendTransaction(
    tx: Transaction,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    if (!this.provider.publicKey) {
      throw new Error("Phantom wallet is not connected");
    }

    // Ensure transaction has mandatory fields before requesting signature.
    tx.feePayer = tx.feePayer || this.provider.publicKey;

    if (!tx.recentBlockhash) {
      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latestBlockhash.blockhash;
    }

    const signed = await this.signTransaction(tx);
    const signature = await connection.sendRawTransaction(
      signed.serialize(),
      options
    );

    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }
}

/**
 * Wallet Factory - create wallet instances
 */
export class WalletFactory {
  static createCustodialWallet(
    keypair: Keypair,
    connection: Connection
  ): CustodialWallet {
    return new CustodialWallet(keypair, connection);
  }

  static getPhantomProvider(): PhantomProvider | null {
    if (typeof window === "undefined") {
      return null;
    }

    const provider = window.solana;
    if (!provider?.isPhantom) {
      return null;
    }

    return provider;
  }

  static async createPhantomWallet(
    options?: { onlyIfTrusted?: boolean }
  ): Promise<PhantomWallet> {
    const provider = this.getPhantomProvider();
    if (!provider) {
      throw new Error("Phantom wallet provider not found. Install Phantom to continue.");
    }

    await provider.connect(options);
    return new PhantomWallet(provider);
  }
}
