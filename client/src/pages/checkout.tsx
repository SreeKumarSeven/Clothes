import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Smartphone, Wallet, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().min(6, "Pincode must be at least 6 characters"),
  paymentMethod: z.enum(["card", "upi", "wallet", "cod"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      paymentMethod: "card",
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const orderItems = cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.salePrice || item.product.price,
      }));

      return apiRequest("POST", "/api/orders", {
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        paymentMethod: data.paymentMethod,
        items: orderItems,
      });
    },
    onSuccess: (response) => {
      const order = response;
      setOrderId(order.id);
      setOrderPlaced(true);
      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.product.salePrice ? parseFloat(item.product.salePrice) : parseFloat(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your order has been placed successfully. We'll send you a confirmation email with tracking details.
            </p>
            
            <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium" data-testid="text-order-id">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium" data-testid="text-order-total">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span className="font-medium">3-5 business days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/orders")} data-testid="button-view-orders">
                View My Orders
              </Button>
              <Button variant="outline" onClick={() => navigate("/products")} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>
          
          <form onSubmit={form.handleSubmit((data) => placeOrderMutation.mutate(data))}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5" />
                      <span>Shipping Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...form.register("firstName")}
                          data-testid="input-first-name"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...form.register("lastName")}
                          data-testid="input-last-name"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          data-testid="input-email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          {...form.register("phone")}
                          data-testid="input-phone"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        {...form.register("address")}
                        data-testid="textarea-address"
                      />
                      {form.formState.errors.address && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...form.register("city")}
                          data-testid="input-city"
                        />
                        {form.formState.errors.city && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          {...form.register("state")}
                          data-testid="input-state"
                        />
                        {form.formState.errors.state && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          {...form.register("pincode")}
                          data-testid="input-pincode"
                        />
                        {form.formState.errors.pincode && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.pincode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("paymentMethod")}
                      onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                      className="space-y-4"
                      data-testid="radio-group-payment"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">UPI</div>
                            <div className="text-sm text-muted-foreground">Pay using UPI ID or QR code</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <Wallet className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Digital Wallet</div>
                            <div className="text-sm text-muted-foreground">Paytm, PhonePe, GPay</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <Truck className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <div className="text-sm text-muted-foreground">Pay when you receive</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cartItems.map((item: any, index: number) => {
                        const product = item.product;
                        const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
                        
                        return (
                          <div key={item.id} className="flex space-x-3" data-testid={`order-item-${index}`}>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {item.size && (
                                  <span className="text-xs bg-secondary px-2 py-1 rounded">Size: {item.size}</span>
                                )}
                                {item.color && (
                                  <span className="text-xs bg-secondary px-2 py-1 rounded">Color: {item.color}</span>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                <span className="text-sm font-medium">₹{(currentPrice * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span data-testid="text-checkout-subtotal">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span data-testid="text-checkout-shipping">
                          {shipping === 0 ? "FREE" : `₹${shipping}`}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span data-testid="text-checkout-total">₹{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={placeOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By placing this order, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
