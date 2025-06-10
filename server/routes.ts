import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { insertUserSchema, loginSchema, sendMoneySchema, type User } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
const ONRAMP_API_KEY = process.env.ONRAMP_API_KEY || process.env.VITE_ONRAMP_API_KEY || "dev-onramp-key";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

// Onramp API integration placeholder - requires real implementation
async function callOnrampAPI(endpoint: string, data?: any, method = 'GET') {
  // TODO: Implement actual HTTP requests to Onramp.money API
  
  // Mock responses for different endpoints
  switch (endpoint) {
    case '/user/create':
      return { userId: `onramp_${Date.now()}`, kycStatus: 'pending' };
    case '/wallet/create':
      return { walletId: `wallet_${Date.now()}`, balance: '0' };
    case '/transaction/create':
      return { transactionId: `txn_${Date.now()}`, status: 'processing' };
    case '/rates/current':
      return {
        rates: [
          { from: 'INR', to: 'USD', rate: '0.01201' },
          { from: 'NGN', to: 'EUR', rate: '0.00134' },
          { from: 'USD', to: 'KES', rate: '129.45' },
          { from: 'EUR', to: 'TRY', rate: '31.82' }
        ]
      };
    default:
      return { success: true };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user in Onramp
      const onrampUser = await callOnrampAPI('/user/create', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phoneNumber
      }, 'POST');

      // Create user in database
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        onrampUserId: onrampUser.userId
      });

      // Create default wallets
      const defaultCurrencies = ['USD', 'EUR', 'INR', 'NGN'];
      for (const currency of defaultCurrencies) {
        const onrampWallet = await callOnrampAPI('/wallet/create', {
          userId: onrampUser.userId,
          currency
        }, 'POST');
        
        await storage.createWallet({
          userId: user.id,
          currency,
          onrampWalletId: onrampWallet.walletId
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Profile update route
  app.put("/api/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { firstName, lastName, email, phone, country } = req.body;
      
      // In a real app, you would update the user in the database
      // For now, we'll just return a success response
      res.json({ 
        message: "Profile updated successfully",
        user: {
          id: req.user.id,
          firstName,
          lastName,
          email,
          phone,
          country
        }
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Stellar wallet creation route
  app.post("/api/stellar/wallet/create", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Update user record to mark Stellar wallet as created
      // In production, this would call Onramp.money API to create actual wallet
      const stellarPublicKey = `GCEXAMPLE${userId}STELLARKEY`;
      
      // Update user with Stellar wallet info
      await storage.updateUserStellarWallet(userId, stellarPublicKey);

      res.json({
        success: true,
        stellarPublicKey,
        message: "Stellar wallet created successfully"
      });
    } catch (error) {
      console.error("Stellar wallet creation error:", error);
      res.status(500).json({ message: "Failed to create Stellar wallet" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Wallet routes
  app.get("/api/wallets", authenticateToken, async (req: any, res) => {
    try {
      const wallets = await storage.getUserWallets(req.user.id);
      res.json(wallets);
    } catch (error) {
      console.error("Get wallets error:", error);
      res.status(500).json({ message: "Failed to get wallets" });
    }
  });

  // Transaction routes
  app.post("/api/transactions/send", authenticateToken, async (req: any, res) => {
    try {
      const transactionData = sendMoneySchema.parse(req.body);
      
      // Get exchange rate from Onramp
      const rateResponse = await callOnrampAPI('/rates/current');
      const rates = rateResponse?.rates || [];
      const rate = rates.find((r: any) => 
        r.from === transactionData.fromCurrency && r.to === transactionData.toCurrency
      );
      
      if (!rate) {
        return res.status(400).json({ message: "Exchange rate not available" });
      }

      const fromAmount = parseFloat(transactionData.fromAmount);
      const toAmount = fromAmount * parseFloat(rate.rate);
      const fee = fromAmount * 0.01; // 1% fee

      // Create transaction in Onramp
      const onrampTransaction = await callOnrampAPI('/transaction/create', {
        fromCurrency: transactionData.fromCurrency,
        toCurrency: transactionData.toCurrency,
        fromAmount: fromAmount,
        toAmount: toAmount,
        recipientEmail: transactionData.recipientEmail,
        paymentMethod: transactionData.paymentMethod
      }, 'POST');

      // Save transaction in database
      const transaction = await storage.createTransaction({
        userId: req.user.id,
        type: 'send',
        fromCurrency: transactionData.fromCurrency,
        toCurrency: transactionData.toCurrency,
        fromAmount: fromAmount.toString(),
        toAmount: toAmount.toString(),
        exchangeRate: rate.rate,
        fee: fee.toString(),
        recipientEmail: transactionData.recipientEmail,
        recipientName: `${transactionData.recipientFirstName} ${transactionData.recipientLastName}`,
        recipientPhone: transactionData.recipientPhone,
        paymentMethod: transactionData.paymentMethod,
        onrampTransactionId: onrampTransaction.transactionId
      });

      res.json(transaction);
    } catch (error) {
      console.error("Send money error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Transaction failed" });
    }
  });

  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Exchange rates route
  app.get("/api/exchange-rates", async (req, res) => {
    try {
      const rateResponse = await callOnrampAPI('/rates/current');
      const rates = rateResponse?.rates || [];
      
      // Save rates to database
      for (const rate of rates) {
        await storage.upsertExchangeRate({
          fromCurrency: rate.from,
          toCurrency: rate.to,
          rate: rate.rate,
          source: 'onramp'
        });
      }
      
      const allRates = await storage.getAllExchangeRates();
      res.json(allRates);
    } catch (error) {
      console.error("Get exchange rates error:", error);
      res.status(500).json({ message: "Failed to get exchange rates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
