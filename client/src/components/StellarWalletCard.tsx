import { useStellarWallet } from "@/hooks/useStellarWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Zap, TrendingUp, ExternalLink } from "lucide-react";

const stellarAssetIcons = {
  USDC: "💵",
  EURC: "💶", 
  XLM: "⭐",
};

const stellarAssetNames = {
  USDC: "USD Coin",
  EURC: "Euro Coin",
  XLM: "Stellar Lumens",
};

export default function StellarWalletCard() {
  const { 
    stellarBalances, 
    totalStellarBalance, 
    balancesLoading,
    createWallet,
    isCreatingWallet 
  } = useStellarWallet();

  if (balancesLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">Stellar Wallet</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">Blockchain</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasWallet = Object.keys(stellarBalances).length > 0;

  if (!hasWallet) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">Stellar Wallet</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">Blockchain</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-blue-600 mb-4">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Enable Stellar Blockchain</h3>
            <p className="text-blue-700 text-sm max-w-md mx-auto">
              Create your Stellar wallet to access USDC/EURC stablecoins with 3-5 second settlements 
              and $0.000005 transaction fees.
            </p>
            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="text-center">
                <div className="text-2xl">💵</div>
                <div className="text-xs text-blue-600">USDC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">💶</div>
                <div className="text-xs text-blue-600">EURC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">⭐</div>
                <div className="text-xs text-blue-600">XLM</div>
              </div>
            </div>
            <Button 
              onClick={() => createWallet()}
              disabled={isCreatingWallet}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isCreatingWallet ? "Creating..." : "Create Stellar Wallet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">Stellar Wallet</CardTitle>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-blue-700">
          <Zap className="w-4 h-4" />
          <span>3-5 sec settlement • $0.000005 fees</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Stellar Balance */}
        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Total Stellar Balance</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${totalStellarBalance.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <div className="text-xs text-blue-600">Stablecoins + XLM</div>
        </div>

        {/* Individual Asset Balances */}
        <div className="space-y-2">
          {Object.entries(stellarBalances).map(([asset, balance]) => {
            const amount = parseFloat(balance);
            if (amount === 0) return null;
            
            return (
              <div key={asset} className="flex items-center justify-between bg-white/40 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {stellarAssetIcons[asset as keyof typeof stellarAssetIcons] || "🪙"}
                  </span>
                  <div>
                    <div className="font-medium text-blue-900">{asset}</div>
                    <div className="text-xs text-blue-600">
                      {stellarAssetNames[asset as keyof typeof stellarAssetNames] || asset}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-900">
                    {amount.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })}
                  </div>
                  <div className="text-xs text-blue-600">{asset}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Convert
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        {/* Stellar Network Info */}
        <div className="text-xs text-blue-600 bg-white/40 rounded p-2">
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="font-medium">Stellar Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span>Settlement:</span>
            <span className="font-medium">3-5 seconds</span>
          </div>
          <div className="flex justify-between">
            <span>Fee:</span>
            <span className="font-medium">~$0.000005</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}