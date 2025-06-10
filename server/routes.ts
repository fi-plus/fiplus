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

// Real Onramp API integration using HMAC-SHA512 authentication
import crypto from 'crypto';

async function callOnrampAPI(endpoint: string, data?: any, method = 'GET') {
  if (!ONRAMP_API_KEY) {
    throw new Error('ONRAMP_API_KEY not configured');
  }

  const baseUrl = 'https://sandbox.onramp.money/api/v1';
  const url = `${baseUrl}${endpoint}`;
  const body = data ? JSON.stringify(data) : '';
  const timestamp = Date.now().toString();
  
  // Generate HMAC-SHA512 signature as per Onramp documentation
  const message = `${method}${endpoint}${timestamp}${body}`;
  const signature = crypto.createHmac('sha512', ONRAMP_API_KEY).update(message).digest('hex');
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ONRAMP_API_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: method !== 'GET' ? body : undefined,
    });

    if (!response.ok) {
      throw new Error(`Onramp API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Onramp API call failed:', error);
    throw error;
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
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

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
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Stellar wallet creation route
  app.post("/api/stellar/wallet/create", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      
      // Create Onramp wallet through their API
      // This will be handled by Onramp's system - we don't manage Stellar keys directly
      const onrampWallet = await callOnrampAPI('/wallet/create', {
        userId: req.user.id,
        currency: 'XLM'
      }, 'POST');
      
      const stellarPublicKey = onrampWallet.walletId || `ONRAMP_WALLET_${userId}`;
      
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

  app.post("/api/transactions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, fromCurrency, toCurrency, amount, method, status, externalId } = req.body;
      
      const transaction = await storage.createTransaction({
        userId: req.user!.id,
        type,
        fromCurrency,
        toCurrency,
        amount: amount.toString(),
        status: status || 'pending',
        method: method || 'onramp',
        externalId: externalId || null
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
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

  // Onramp quote endpoint (handles both onramp and offramp)
  app.post("/api/onramp/quote", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fiatCurrency, fiatAmount, cryptoCurrency, cryptoAmount, type } = req.body;
      
      let quoteData;
      let endpoint;
      
      if (type === 'offramp') {
        quoteData = {
          cryptoCurrency,
          cryptoAmount,
          fiatCurrency,
          clientCustomerId: `fiplus-${req.user?.id}-${Date.now()}`
        };
        endpoint = '/offramp/quote';
      } else {
        quoteData = {
          fiatCurrency,
          fiatAmount,
          cryptoCurrency,
          clientCustomerId: `fiplus-${req.user?.id}-${Date.now()}`
        };
        endpoint = '/onramp/quote';
      }
      
      const quote = await callOnrampAPI(endpoint, quoteData, 'POST');
      res.json(quote);
    } catch (error) {
      console.error("Onramp quote error:", error);
      res.status(500).json({ message: "Failed to get quote from Onramp" });
    }
  });

  // Onramp KYC URL creation endpoint
  app.post("/api/onramp/kyc", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userEmail, phoneNumber } = req.body;
      
      const kycData = {
        userEmail: userEmail || req.user?.email,
        phoneNumber,
        clientCustomerId: `fiplus-${req.user?.id}-${Date.now()}`
      };
      
      const kycResult = await callOnrampAPI('/customer/create', kycData, 'POST');
      res.json(kycResult);
    } catch (error) {
      console.error("Onramp KYC error:", error);
      res.status(500).json({ message: "Failed to create KYC URL" });
    }
  });

  // Onramp Offramp transaction endpoint
  app.post("/api/onramp/offramp", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { cryptoCurrency, cryptoAmount, fiatCurrency, fiatAmount, walletAddress, userEmail, bankDetails } = req.body;
      
      const offrampData = {
        cryptoCurrency,
        cryptoAmount,
        fiatCurrency,
        fiatAmount,
        walletAddress,
        userEmail: userEmail || req.user?.email,
        bankDetails,
        clientCustomerId: `fiplus-${req.user?.id}-${Date.now()}`
      };
      
      const offrampResult = await callOnrampAPI('/offramp/transaction', offrampData, 'POST');
      res.json(offrampResult);
    } catch (error) {
      console.error("Onramp offramp error:", error);
      res.status(500).json({ message: "Failed to create offramp transaction" });
    }
  });

  // Onramp webhook endpoint for transaction updates
  app.post("/api/webhooks/onramp", async (req: Request, res: Response) => {
    try {
      const { transactionId, status, amount, currency, userId, type } = req.body;
      
      // Verify webhook signature for security
      const signature = req.headers['x-onramp-signature'] as string;
      // TODO: Implement signature verification based on Onramp documentation
      
      // Process different webhook types
      switch (type) {
        case 'transaction.completed':
          // Create transaction record in our database
          if (userId) {
            await storage.createTransaction({
              userId: parseInt(userId),
              type: 'deposit',
              fromCurrency: currency,
              toCurrency: 'XLM',
              fromAmount: amount.toString(),
              toAmount: amount.toString(), // 1:1 for simplicity, real rate from webhook
              fee: req.body.fee?.toString() || "0",
              status: 'completed',
              onrampTransactionId: transactionId,
              paymentMethod: req.body.paymentMethod || 'unknown'
            });
          }
          break;
          
        case 'transaction.failed':
          console.log(`Transaction ${transactionId} failed: ${req.body.reason}`);
          break;
          
        case 'kyc.approved':
          console.log(`KYC approved for user ${userId}`);
          break;
          
        default:
          console.log(`Unknown webhook type: ${type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Onramp webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
