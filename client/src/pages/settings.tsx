import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Shield, Bell, CreditCard, Globe, Smartphone, LogOut, Eye, EyeOff, Lock, Download, Trash2, HelpCircle, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      country: "",
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="font-bold text-foreground text-2xl md:text-3xl">Settings</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <Avatar className="w-16 h-16 md:w-20 md:h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                    {getUserInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{user?.email}</p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-9">
                      Change Photo
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <Mail className="w-4 h-4 mr-2" />
                      Verify Email
                    </Button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      className="minimal-input"
                      {...register("firstName", { required: "First name is required" })}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{errors.firstName.message as string}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      className="minimal-input"
                      {...register("lastName", { required: "Last name is required" })}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{errors.lastName.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    className="minimal-input"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      className="minimal-input"
                      {...register("phone")}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      className="minimal-input"
                      {...register("country")}
                      placeholder="United States"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="minimal-button h-11"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Biometric Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face recognition for quick access
                  </p>
                </div>
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={setBiometricEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Recovery Codes
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Password last changed 3 months ago
                </p>
              </div>

              <Separator />

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Status</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your account security is strong. Consider enabling 2FA for enhanced protection.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your transactions via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get text messages for important account updates
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications on your mobile device
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and product updates
                  </p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Section */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid gap-3">
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Visa ••••4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/26</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full h-11 justify-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Smartphone className="w-5 h-5" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional & Language Settings */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5" />
                Regional & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div>
                <Label htmlFor="language" className="text-base font-medium">Language</Label>
                <select 
                  className="w-full mt-2 h-11 px-3 bg-background border border-border rounded-md text-foreground minimal-input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <Label htmlFor="currency" className="text-base font-medium">Default Currency</Label>
                <select 
                  className="w-full mt-2 h-11 px-3 bg-background border border-border rounded-md text-foreground minimal-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div>
                <Label htmlFor="timezone" className="text-base font-medium">Timezone</Label>
                <select 
                  className="w-full mt-2 h-11 px-3 bg-background border border-border rounded-md text-foreground minimal-input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC">UTC - Coordinated Universal Time</option>
                  <option value="EST">EST - Eastern Standard Time</option>
                  <option value="PST">PST - Pacific Standard Time</option>
                  <option value="GMT">GMT - Greenwich Mean Time</option>
                  <option value="IST">IST - India Standard Time</option>
                  <option value="JST">JST - Japan Standard Time</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-11">
                  <Download className="w-4 h-4 mr-2" />
                  Download Your Data
                </Button>
                <Button variant="outline" className="justify-start h-11">
                  <Eye className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button variant="outline" className="justify-start h-11 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Privacy Notice</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      We protect your personal data according to GDPR and other privacy regulations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <HelpCircle className="w-5 h-5" />
                Help & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start h-11">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start h-11">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start h-11">
                <Phone className="w-4 h-4 mr-2" />
                Request Callback
              </Button>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="minimal-card border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your fi.plus account on this device
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-11"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}