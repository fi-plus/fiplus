import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onrampStellar } from "@/lib/onramp-stellar";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useStellarWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get Stellar wallet balances (USDC, EURC, XLM)
  const { data: stellarBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/stellar/balances", user?.id],
    queryFn: async () => {
      if (!user?.stellarPublicKey) {
        return {};
      }
      return await onrampStellar.getWalletBalances(user.stellarPublicKey);
    },
    enabled: !!user?.stellarPublicKey,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get Stellar transaction history
  const { data: stellarTransactions, isLoading: txLoading } = useQuery({
    queryKey: ["/stellar/transactions", user?.id],
    queryFn: async () => {
      if (!user?.stellarPublicKey) {
        return [];
      }
      return await onrampStellar.getTransactionHistory(user.stellarPublicKey);
    },
    enabled: !!user?.stellarPublicKey,
    staleTime: 60 * 1000, // 1 minute
  });

  // Create Stellar wallet
  const createWalletMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      // For demo purposes, we'll simulate wallet creation
      // In production, this would call the actual Onramp API
      return {
        publicKey: "GCEXAMPLE" + user.id + "STELLARKEY",
        balance: { USDC: "0", EURC: "0", XLM: "10" },
        trustlines: ["USDC", "EURC"]
      };
    },
    onSuccess: (wallet) => {
      toast({
        title: "Stellar Wallet Created",
        description: "Your wallet supports USDC, EURC, and XLM transfers.",
      });
      queryClient.invalidateQueries({ queryKey: ["/stellar/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Wallet Creation Failed",
        description: error.message || "Failed to create Stellar wallet.",
        variant: "destructive",
      });
    },
  });

  // Send cross-border payment via Stellar
  const sendPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      fromCurrency: string;
      toCurrency: string;
      amount: number;
      recipientAddress: string;
      recipientName: string;
      paymentMethod: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await onrampStellar.sendCrossBorderPayment({
        userId: user.id.toString(),
        ...paymentData,
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Payment Sent",
        description: `Transaction settled on Stellar network. Hash: ${result.stellarTxHash.substring(0, 8)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/stellar/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/stellar/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to send payment via Stellar.",
        variant: "destructive",
      });
    },
  });

  // Deposit fiat to stablecoin (SEP-24)
  const depositMutation = useMutation({
    mutationFn: async (depositData: {
      fiatCurrency: string;
      amount: number;
      paymentMethod: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await onrampStellar.depositFiatToStablecoin(
        user.id.toString(),
        depositData.fiatCurrency,
        depositData.amount,
        depositData.paymentMethod
      );
    },
    onSuccess: (result) => {
      toast({
        title: "Deposit Initiated",
        description: "Follow the instructions to complete your deposit.",
      });
      queryClient.invalidateQueries({ queryKey: ["/stellar/balances"] });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to initiate deposit.",
        variant: "destructive",
      });
    },
  });

  // Withdraw stablecoin to fiat (SEP-24)
  const withdrawMutation = useMutation({
    mutationFn: async (withdrawData: {
      stablecoin: string;
      amount: number;
      destinationCurrency: string;
      bankDetails: any;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await onrampStellar.withdrawStablecoinToFiat(
        user.id.toString(),
        withdrawData.stablecoin,
        withdrawData.amount,
        withdrawData.destinationCurrency,
        withdrawData.bankDetails
      );
    },
    onSuccess: (result) => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your stablecoin withdrawal is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/stellar/balances"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to initiate withdrawal.",
        variant: "destructive",
      });
    },
  });

  // Convert between stablecoins using Stellar DEX
  const convertMutation = useMutation({
    mutationFn: async (convertData: {
      fromAsset: string;
      toAsset: string;
      amount: number;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      return await onrampStellar.convertCurrency(
        user.id.toString(),
        convertData.fromAsset,
        convertData.toAsset,
        convertData.amount
      );
    },
    onSuccess: (result) => {
      toast({
        title: "Conversion Complete",
        description: `Converted via Stellar DEX. Rate: ${result.exchangeRate}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/stellar/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/stellar/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert currency.",
        variant: "destructive",
      });
    },
  });

  // Calculate total balance in USD equivalent
  const totalStellarBalance = stellarBalances ? 
    Object.entries(stellarBalances).reduce((total, [currency, balance]) => {
      const amount = parseFloat(balance);
      // Convert to USD equivalent (simplified)
      const usdValue = currency === 'USDC' ? amount :
                      currency === 'EURC' ? amount * 1.08 :
                      currency === 'XLM' ? amount * 0.12 : // Approximate XLM price
                      amount;
      return total + usdValue;
    }, 0) : 0;

  return {
    // Data
    stellarBalances: stellarBalances || {},
    stellarTransactions: stellarTransactions || [],
    totalStellarBalance,
    
    // Loading states
    balancesLoading,
    txLoading,
    
    // Mutations
    createWallet: createWalletMutation.mutate,
    sendPayment: sendPaymentMutation.mutate,
    deposit: depositMutation.mutate,
    withdraw: withdrawMutation.mutate,
    convert: convertMutation.mutate,
    
    // Mutation states
    isCreatingWallet: createWalletMutation.isPending,
    isSendingPayment: sendPaymentMutation.isPending,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isConverting: convertMutation.isPending,
  };
}