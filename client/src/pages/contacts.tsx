import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  currency: string;
}

export default function Contacts() {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Mock contacts data since we don't have a contacts table
  const contacts: Contact[] = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 234 567 8900",
      country: "United States",
      currency: "USD"
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+34 612 345 678",
      country: "Spain",
      currency: "EUR"
    },
    {
      id: 3,
      name: "Raj Patel",
      email: "raj.patel@example.com",
      phone: "+91 98765 43210",
      country: "India",
      currency: "INR"
    },
    {
      id: 4,
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phone: "+234 801 234 5678",
      country: "Nigeria",
      currency: "NGN"
    }
  ];

  const addContactMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call - in real app this would save to database
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Contact Added",
        description: "New contact has been added successfully.",
      });
      setIsAddingContact(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    addContactMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sendMoney = (contact: Contact) => {
    // Navigate to dashboard with pre-filled recipient info
    const params = new URLSearchParams({
      toEmail: contact.email,
      toName: contact.name,
      toCurrency: contact.currency
    });
    window.location.href = `/?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-2">Manage your frequent recipients</p>
          </div>
          <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
            <DialogTrigger asChild>
              <Button className="minimal-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    className="minimal-input"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    className="minimal-input"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    className="minimal-input"
                    {...register("phone")}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    className="minimal-input"
                    {...register("country", { required: "Country is required" })}
                    placeholder="Enter country"
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive mt-1">{errors.country.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Input
                    id="currency"
                    className="minimal-input"
                    {...register("currency", { required: "Currency is required" })}
                    placeholder="e.g., USD, EUR, INR"
                  />
                  {errors.currency && (
                    <p className="text-sm text-destructive mt-1">{errors.currency.message as string}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full minimal-button"
                  disabled={addContactMutation.isPending}
                >
                  {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p className="text-gray-600 mb-4">Add your first contact to start sending money quickly</p>
              <Button onClick={() => setIsAddingContact(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-white font-medium">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.currency}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {contact.country}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => sendMoney(contact)}
                    className="w-full"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Money
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <MobileNavigation />
    </div>
  );
}