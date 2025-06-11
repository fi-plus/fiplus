import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, FileText, CheckCircle2, Clock, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KYCVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'intro' | 'selfie' | 'document' | 'processing' | 'completed'>('intro');
  const [progress, setProgress] = useState(0);

  const handleSelfieCapture = () => {
    setStep('selfie');
    setProgress(33);
    setTimeout(() => {
      setStep('document');
      setProgress(66);
    }, 2000);
  };

  const handleDocumentScan = () => {
    setStep('processing');
    setProgress(90);
    setTimeout(() => {
      setStep('completed');
      setProgress(100);
      toast({
        title: "Identity Verified",
        description: "Your account limits have been unlocked.",
      });
    }, 3000);
  };

  const getStatusBadge = () => {
    switch (step) {
      case 'intro':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-300">In Progress</Badge>;
    }
  };

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center minimal-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Identity Verified!</h2>
            <p className="text-muted-foreground mb-6">
              Your account is now fully verified. All transaction limits have been unlocked.
            </p>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-400 mb-2">New Limits Available:</h3>
              <div className="text-sm text-green-400/80 space-y-1">
                <div>• Send up to $10,000 per transaction</div>
                <div>• Monthly limit: $50,000</div>
                <div>• Instant withdrawals to bank accounts</div>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full minimal-button"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">fi.plus</h1>
              {getStatusBadge()}
            </div>
            <div className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Identity</h1>
          <p className="text-xl text-gray-600">
            Complete KYC verification to unlock full sending limits and instant withdrawals
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Verification Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {step === 'intro' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-blue-600" />
                <span>Quick Identity Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-gray-600">
                We need to verify your identity to comply with global financial regulations. 
                This process takes less than 2 minutes.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Selfie Verification</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Take a quick selfie to verify your identity
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Document Scan</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan your government-issued ID or passport
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900">Current Limits (Unverified)</div>
                    <div className="text-sm text-amber-700 mt-1">
                      • Send up to $100 per transaction
                      • Monthly limit: $1,000
                      • Standard withdrawal times
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSelfieCapture}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'selfie' && (
          <Card>
            <CardHeader>
              <CardTitle>Take Your Selfie</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-gray-600">
                Position your face within the frame and ensure good lighting
              </div>
              <Button 
                onClick={handleDocumentScan}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Capture Selfie
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'document' && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Your ID Document</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-64 h-40 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-gray-600">
                Please scan the front of your government-issued ID, driver's license, or passport
              </div>
              <Button 
                onClick={handleDocumentScan}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Scan Document
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Processing Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <div className="text-gray-600">
                We're verifying your documents. This usually takes just a few seconds...
              </div>
              <div className="text-sm text-gray-500">
                Please don't close this page
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}