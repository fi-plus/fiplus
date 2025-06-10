import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  kycStatus: text("kyc_status").default("pending"), // pending, verified, rejected
  onrampUserId: text("onramp_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  onrampWalletId: text("onramp_wallet_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // send, receive, convert
  fromCurrency: varchar("from_currency", { length: 10 }),
  toCurrency: varchar("to_currency", { length: 10 }),
  fromAmount: decimal("from_amount", { precision: 20, scale: 8 }),
  toAmount: decimal("to_amount", { precision: 20, scale: 8 }),
  exchangeRate: decimal("exchange_rate", { precision: 20, scale: 8 }),
  fee: decimal("fee", { precision: 20, scale: 8 }),
  status: text("status").default("pending"), // pending, processing, completed, failed
  recipientEmail: text("recipient_email"),
  recipientName: text("recipient_name"),
  recipientPhone: text("recipient_phone"),
  onrampTransactionId: text("onramp_transaction_id"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: varchar("from_currency", { length: 10 }).notNull(),
  toCurrency: varchar("to_currency", { length: 10 }).notNull(),
  rate: decimal("rate", { precision: 20, scale: 8 }).notNull(),
  source: text("source").default("onramp"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onrampUserId: true,
  kycStatus: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onrampWalletId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  onrampTransactionId: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const sendMoneySchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  fromAmount: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientFirstName: z.string().min(1),
  recipientLastName: z.string().min(1),
  recipientPhone: z.string(),
  paymentMethod: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type SendMoneyData = z.infer<typeof sendMoneySchema>;
