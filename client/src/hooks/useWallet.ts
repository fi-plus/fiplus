import { useQuery } from "@tanstack/react-query";
import type { Wallet } from "@shared/schema";

export function useWallet() {
  const { data: wallets, isLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    staleTime: 30 * 1000, // 30 seconds
  });

  const totalBalance = wallets?.reduce((total, wallet) => {
    // Convert all balances to USD for display
    const balance = parseFloat(wallet.balance || "0");
    // This is a simplified conversion - in real app, use actual exchange rates
    const usdValue = wallet.currency === "USD" ? balance : 
                    wallet.currency === "EUR" ? balance * 1.08 :
                    wallet.currency === "INR" ? balance * 0.012 :
                    wallet.currency === "NGN" ? balance * 0.00067 : balance;
    return total + usdValue;
  }, 0) || 0;

  return {
    wallets: wallets || [],
    totalBalance,
    isLoading,
  };
}
