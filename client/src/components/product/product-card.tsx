import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: any;
  viewMode?: "grid" | "list";
  className?: string;
}

export default function ProductCard({ product, viewMode = "grid", className }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = parseFloat(product.price);
  const discount = product.salePrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to sign in to add items to cart.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      // For simplicity, always try to add to wishlist
      return apiRequest("POST", "/api/wishlist", { productId: product.id });
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Product has been added to your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to sign in to add items to wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      // If it fails, it might already be in wishlist, so try to remove
      apiRequest("DELETE", `/api/wishlist/${product.id}`)
        .then(() => {
          toast({
            title: "Removed from Wishlist",
            description: "Product has been removed from your wishlist.",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to update wishlist.",
            variant: "destructive",
          });
        });
    },
  });

  if (viewMode === "list") {
    return (
      <Card className={`hover:shadow-lg transition-shadow ${className}`} data-testid="card-product-list">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <Link href={`/product/${product.id}`}>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg"
                data-testid="img-product-list"
              />
            </Link>
            
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors" data-testid="text-product-name-list">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl font-bold text-foreground" data-testid="text-product-price-list">
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
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground">{product.rating || "0"} ({product.reviewCount || 0})</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {product.isFeatured && <Badge>Featured</Badge>}
                  {product.tags?.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWishlistMutation.mutate()}
                      disabled={toggleWishlistMutation.isPending}
                      data-testid="button-wishlist-list"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => addToCartMutation.mutate()}
                    disabled={addToCartMutation.isPending}
                    data-testid="button-add-to-cart-list"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-lg transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="card-product-grid"
    >
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/product/${product.id}`}>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
              data-testid="img-product-grid"
            />
          </Link>
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs font-medium">
                -{discount}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="text-xs font-medium">
                Featured
              </Badge>
            )}
            {product.tags?.includes("new") && (
              <Badge variant="secondary" className="text-xs font-medium">
                New
              </Badge>
            )}
          </div>
          
          {/* Wishlist button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-3 right-3 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlistMutation.mutate();
              }}
              disabled={toggleWishlistMutation.isPending}
              data-testid="button-wishlist-grid"
            >
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="p-4">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2" data-testid="text-product-name-grid">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-foreground" data-testid="text-product-price-grid">
                ₹{currentPrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-muted-foreground">{product.rating || "0"}</span>
            </div>
          </div>
          
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              addToCartMutation.mutate();
            }}
            disabled={addToCartMutation.isPending}
            data-testid="button-add-to-cart-grid"
          >
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
