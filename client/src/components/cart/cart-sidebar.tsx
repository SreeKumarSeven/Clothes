import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
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

  if (!isAuthenticated) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Shopping Cart</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view cart</h3>
            <p className="text-muted-foreground text-center mb-6">
              Please sign in to add items to your cart and checkout.
            </p>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-sign-in-cart">
              Sign In
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.product.salePrice ? parseFloat(item.product.salePrice) : parseFloat(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Shopping Cart</span>
            </div>
            <Badge variant="secondary">{cartItems.length} items</Badge>
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Add some items to your cart to get started.
            </p>
            <Button onClick={() => onOpenChange(false)} data-testid="button-continue-shopping-empty">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cartItems.map((item: any, index: number) => {
                const product = item.product;
                const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
                const originalPrice = parseFloat(product.price);
                const discount = product.salePrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

                return (
                  <div key={item.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg" data-testid={`cart-item-${index}`}>
                    <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        data-testid={`cart-item-image-${index}`}
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                        <h4 className="font-medium text-foreground text-sm hover:text-primary transition-colors line-clamp-2" data-testid={`cart-item-name-${index}`}>
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.size && (
                          <Badge variant="secondary" className="text-xs">Size: {item.size}</Badge>
                        )}
                        {item.color && (
                          <Badge variant="secondary" className="text-xs">Color: {item.color}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-sm" data-testid={`cart-item-price-${index}`}>
                            ₹{currentPrice.toLocaleString()}
                          </span>
                          {discount > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                          data-testid={`cart-item-remove-${index}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          data-testid={`cart-item-decrease-${index}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center" data-testid={`cart-item-quantity-${index}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`cart-item-increase-${index}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="cart-subtotal">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span data-testid="cart-shipping">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                    Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                  </p>
                )}
                
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span data-testid="cart-total">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/checkout" onClick={() => onOpenChange(false)}>
                  <Button size="lg" className="w-full" data-testid="button-checkout-cart">
                    Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" size="lg" className="w-full" data-testid="button-view-cart">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
