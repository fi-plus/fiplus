import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  NGN: '₦',
  KES: 'KSh',
  TRY: '₺',
};

const currencyColors: Record<string, string> = {
  USD: 'bg-green-100 text-green-600',
  EUR: 'bg-blue-100 text-blue-600',
  INR: 'bg-orange-100 text-orange-600',
  NGN: 'bg-purple-100 text-purple-600',
  KES: 'bg-yellow-100 text-yellow-600',
  TRY: 'bg-red-100 text-red-600',
};

export default function WalletBalances() {
  const { wallets, isLoading } = useWallet();

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Your Wallets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : (
            wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currencyColors[wallet.currency] || 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className="text-xs font-bold">
                      {currencySymbols[wallet.currency] || wallet.currency}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{wallet.currency} Wallet</p>
                    <p className="text-sm text-gray-500">{wallet.currency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {currencySymbols[wallet.currency] || wallet.currency} {parseFloat(wallet.balance || "0").toLocaleString()}
                  </p>
                  {wallet.currency !== 'USD' && (
                    <p className="text-sm text-gray-500">
                      ${(parseFloat(wallet.balance || "0") * 0.012).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 text-gray-700 border-gray-200 hover:bg-gray-50 h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Currency
        </Button>
      </CardContent>
    </Card>
  );
}
