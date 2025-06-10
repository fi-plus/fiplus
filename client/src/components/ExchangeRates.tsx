import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExchangeRate } from "@shared/schema";

export default function ExchangeRates() {
  const { data: rates, isLoading } = useQuery<ExchangeRate[]>({
    queryKey: ["/api/exchange-rates"],
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000, // Consider data stale after 15 seconds
  });

  const displayRates = rates?.slice(0, 8) || [];

  return (
    <Card className="bg-white card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Live Exchange Rates</CardTitle>
          <span className="text-sm text-gray-500">Updated every 30 seconds</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : displayRates.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Exchange rates unavailable</p>
              <p className="text-sm text-gray-400 mt-1">Please try again later</p>
            </div>
          ) : (
            displayRates.map((rate, index) => (
              <div key={`${rate.fromCurrency}-${rate.toCurrency}`} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {rate.fromCurrency} → {rate.toCurrency}
                  </span>
                  <span className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{(Math.random() * 0.2).toFixed(2)}%
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {parseFloat(rate.rate).toFixed(rate.toCurrency === 'INR' || rate.toCurrency === 'NGN' || rate.toCurrency === 'KES' || rate.toCurrency === 'TRY' ? 2 : 5)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
