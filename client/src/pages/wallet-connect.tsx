import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Star, Zap, Shield, ArrowRight, CheckCircle2, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

export default function WalletConnect() {
  const { user } = useAuth();
  const { createWallet, isCreatingWallet } = useStellarWallet();
  const { toast } = useToast();
  const [step, setStep] = useState<'intro' | 'connecting' | 'success'>('intro');

  const handleConnectWallet = async () => {
    setStep('connecting');
    try {
      await createWallet();
      setStep('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setStep('intro');
      toast({
        title: "Connection Failed",
        description: "Please try connecting your wallet again.",
        variant: "destructive",
      });
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-screen">
          <Card className="max-w-md w-full text-center minimal-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Connected!</h2>
            <p className="text-muted-foreground mb-4">
              Your Stellar wallet is ready for cross-border payments with USDC and EURC.
            </p>
            <div className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'connecting') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-screen">
          <Card className="max-w-md w-full text-center minimal-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Creating Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Setting up your Stellar wallet with USDC/EURC support...
            </p>
            <div className="text-sm text-muted-foreground">
              This may take a few moments
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">fi.plus</h1>
              <Badge className="bg-primary/20 text-primary">Stellar</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Welcome, {user?.firstName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Connect Your Stellar Wallet
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create your Stellar wallet to access instant cross-border payments with USDC and EURC stablecoins
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center minimal-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">3-5 Second Settlement</h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast transactions on the Stellar network
              </p>
            </CardContent>
          </Card>

          <Card className="text-center minimal-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">$0.000005 Fees</h3>
              <p className="text-sm text-muted-foreground">
                Minimal transaction costs for global transfers
              </p>
            </CardContent>
          </Card>

          <Card className="text-center minimal-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">30+ Countries</h3>
              <p className="text-sm text-muted-foreground">
                Send money across global remittance corridors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Wallet Connection Card */}
        <Card className="max-w-2xl mx-auto minimal-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Your Stellar Wallet</CardTitle>
            <p className="text-muted-foreground">
              Connect to access USDC, EURC, and XLM for cross-border payments
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supported Assets */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-muted/50 rounded-lg p-4">
                <div className="text-3xl mb-2">💵</div>
                <div className="font-medium text-foreground">USDC</div>
                <div className="text-xs text-muted-foreground">USD Coin</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-4">
                <div className="text-3xl mb-2">💶</div>
                <div className="font-medium text-foreground">EURC</div>
                <div className="text-xs text-muted-foreground">Euro Coin</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-4">
                <div className="text-3xl mb-2">⭐</div>
                <div className="font-medium text-foreground">XLM</div>
                <div className="text-xs text-muted-foreground">Stellar Lumens</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">What you get:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Instant stablecoin transfers worldwide</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>SEP-24/31 compliant deposit/withdrawal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Integrated KYC and compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Multi-currency wallet management</span>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnectWallet}
              disabled={isCreatingWallet}
              className="w-full minimal-button py-4 text-lg"
              size="lg"
            >
              {isCreatingWallet ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Stellar Wallet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3 text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              Secured by Stellar blockchain and Onramp.money infrastructure
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by Stellar Network • SEP-24/31 Compliant • Licensed Money Transmitter</p>
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}