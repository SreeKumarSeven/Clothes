import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Minus, Plus, Trash2, Heart, ArrowRight } from "lucide-react";

export default function Cart() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string, quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    },
  });

  const moveToWishlistMutation = useMutation({
    mutationFn: async ({ productId, cartItemId }: { productId: string, cartItemId: string }) => {
      await apiRequest("POST", "/api/wishlist", { productId });
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Moved to Wishlist",
        description: "Item has been moved to your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
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
        title: "Error",
        description: "Failed to move item to wishlist.",
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

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.product.salePrice ? parseFloat(item.product.salePrice) : parseFloat(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/products">
              <Button size="lg" data-testid="button-start-shopping">
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
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
          <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any, index: number) => {
                const product = item.product;
                const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
                const originalPrice = parseFloat(product.price);
                const discount = product.salePrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

                return (
                  <Card key={item.id} data-testid={`card-cart-item-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Link href={`/product/${product.id}`}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                            data-testid={`img-cart-item-${index}`}
                          />
                        </Link>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link href={`/product/${product.id}`}>
                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors" data-testid={`text-cart-item-name-${index}`}>
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                              {item.size && (
                                <Badge variant="secondary" className="mt-1">Size: {item.size}</Badge>
                              )}
                              {item.color && (
                                <Badge variant="secondary" className="mt-1 ml-2">Color: {item.color}</Badge>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemMutation.mutate(item.id)}
                              disabled={removeItemMutation.isPending}
                              data-testid={`button-remove-item-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-foreground text-lg" data-testid={`text-cart-item-price-${index}`}>
                                ₹{currentPrice.toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <>
                                  <span className="text-sm text-muted-foreground line-through">
                                    ₹{originalPrice.toLocaleString()}
                                  </span>
                                  <Badge variant="destructive" className="text-xs">{discount}% OFF</Badge>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                  disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                  data-testid={`button-decrease-quantity-${index}`}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium" data-testid={`text-cart-item-quantity-${index}`}>
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                  disabled={updateQuantityMutation.isPending}
                                  data-testid={`button-increase-quantity-${index}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveToWishlistMutation.mutate({ productId: product.id, cartItemId: item.id })}
                              disabled={moveToWishlistMutation.isPending}
                              data-testid={`button-move-to-wishlist-${index}`}
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Move to Wishlist
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium" data-testid="text-subtotal">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium" data-testid="text-shipping">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                    
                    {shipping > 0 && (
                      <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                        Add ₹{(999 - subtotal).toLocaleString()} more to get FREE shipping!
                      </p>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span data-testid="text-total">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Link href="/checkout">
                      <Button size="lg" className="w-full" data-testid="button-proceed-to-checkout">
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    
                    <Link href="/products">
                      <Button variant="outline" size="lg" className="w-full" data-testid="button-continue-shopping">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Payment Options */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-foreground mb-3">We Accept</h3>
                    <div className="flex space-x-2">
                      <div className="bg-secondary p-2 rounded text-xs font-medium">VISA</div>
                      <div className="bg-secondary p-2 rounded text-xs font-medium">UPI</div>
                      <div className="bg-secondary p-2 rounded text-xs font-medium">Wallet</div>
                      <div className="bg-secondary p-2 rounded text-xs font-medium">COD</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
