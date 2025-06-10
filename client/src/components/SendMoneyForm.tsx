import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMoneySchema, type SendMoneyData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Send, University, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
];

// Mock exchange rates
const exchangeRates: Record<string, Record<string, number>> = {
  INR: { USD: 0.01201, EUR: 0.01112, NGN: 18.95, KES: 1.56 },
  USD: { INR: 83.25, EUR: 0.926, NGN: 1578, KES: 129.45 },
  EUR: { INR: 89.92, USD: 1.08, NGN: 1703, KES: 139.82 },
  NGN: { USD: 0.00063, EUR: 0.00059, INR: 0.053, KES: 0.082 },
  KES: { USD: 0.00772, EUR: 0.00715, INR: 0.641, NGN: 12.19 },
  TRY: { USD: 0.0314, EUR: 0.0291, INR: 2.61, NGN: 49.56 },
};

export default function SendMoneyForm() {
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SendMoneyData>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      fromCurrency: "INR",
      toCurrency: "USD",
      paymentMethod: "bank",
    },
  });

  const sendMoneyMutation = useMutation({
    mutationFn: async (data: SendMoneyData) => {
      const response = await apiRequest("POST", "/api/transactions/send", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer initiated",
        description: "Your money transfer has been successfully initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "Transfer failed",
      });
    },
  });

  // Calculate exchange rate and update amounts
  useEffect(() => {
    if (fromAmount && fromCurrency && toCurrency) {
      const rate = exchangeRates[fromCurrency]?.[toCurrency] || 0;
      const calculatedAmount = (parseFloat(fromAmount) * rate).toFixed(2);
      setToAmount(calculatedAmount);
    }
  }, [fromAmount, fromCurrency, toCurrency]);

  const onSubmit = (data: SendMoneyData) => {
    sendMoneyMutation.mutate({
      ...data,
      fromAmount: fromAmount,
    });
  };

  const exchangeRate = exchangeRates[fromCurrency]?.[toCurrency] || 0;
  const fee = parseFloat(fromAmount || "0") * 0.01; // 1% fee

  return (
    <Card className="bg-white card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Send Money</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secured by Onramp.money</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">You Send</Label>
              <Select value={fromCurrency} onValueChange={(value) => {
                setFromCurrency(value);
                setValue("fromCurrency", value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Recipient Gets</Label>
              <Select value={toCurrency} onValueChange={(value) => {
                setToCurrency(value);
                setValue("toCurrency", value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="text-lg font-medium bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Exchange Rate</span>
              <span className="font-medium text-gray-900">1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Transfer Fee</span>
              <span className="font-medium text-gray-900">${fee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Delivery Time</span>
              <span className="font-medium text-green-600">3-5 seconds</span>
            </div>
          </div>

          {/* Recipient Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recipient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="First Name"
                  {...register("recipientFirstName")}
                />
                {errors.recipientFirstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.recipientFirstName.message}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last Name"
                  {...register("recipientLastName")}
                />
                {errors.recipientLastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.recipientLastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                {...register("recipientEmail")}
              />
              {errors.recipientEmail && (
                <p className="text-sm text-red-600 mt-1">{errors.recipientEmail.message}</p>
              )}
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Phone Number"
                {...register("recipientPhone")}
              />
              {errors.recipientPhone && (
                <p className="text-sm text-red-600 mt-1">{errors.recipientPhone.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Payment Method</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => {
                    setPaymentMethod("bank");
                    setValue("paymentMethod", "bank");
                  }}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 ${
                  paymentMethod === "bank" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <div className="flex items-center space-x-3">
                    <University className="text-primary w-5 h-5" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Transfer</p>
                      <p className="text-sm text-gray-500">3-5 seconds</p>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => {
                    setPaymentMethod("card");
                    setValue("paymentMethod", "card");
                  }}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 ${
                  paymentMethod === "card" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-gray-600 w-5 h-5" />
                    <div>
                      <p className="font-medium text-gray-900">Debit Card</p>
                      <p className="text-sm text-gray-500">Instant</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {sendMoneyMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {sendMoneyMutation.error instanceof Error ? sendMoneyMutation.error.message : "Transaction failed"}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={sendMoneyMutation.isPending || !fromAmount}
          >
            {sendMoneyMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Send Money Now</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
