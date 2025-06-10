import { users, wallets, transactions, exchangeRates, type User, type InsertUser, type Wallet, type InsertWallet, type Transaction, type InsertTransaction, type ExchangeRate, type InsertExchangeRate } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserStellarWallet(userId: number, stellarPublicKey: string): Promise<User>;

  // Wallet methods
  getUserWallets(userId: number): Promise<Wallet[]>;
  createWallet(insertWallet: InsertWallet): Promise<Wallet>;

  // Transaction methods
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(insertTransaction: InsertTransaction): Promise<Transaction>;

  // Exchange rate methods
  getAllExchangeRates(): Promise<ExchangeRate[]>;
  upsertExchangeRate(insertExchangeRate: InsertExchangeRate): Promise<ExchangeRate>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values(insertWallet)
      .returning();
    return wallet;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(transactions.createdAt);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates);
  }

  async upsertExchangeRate(insertExchangeRate: InsertExchangeRate): Promise<ExchangeRate> {
    const [rate] = await db
      .insert(exchangeRates)
      .values(insertExchangeRate)
      .onConflictDoUpdate({
        target: [exchangeRates.fromCurrency, exchangeRates.toCurrency],
        set: { rate: insertExchangeRate.rate, updatedAt: new Date() }
      })
      .returning();
    return rate;
  }

  async updateUserStellarWallet(userId: number, stellarPublicKey: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stellarPublicKey,
        stellarWalletCreated: true,
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();