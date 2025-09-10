import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Truck, 
  Menu,
  ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product, WishlistItem } from "@shared/schema";
import CartSidebar from "@/components/cart/cart-sidebar";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: wishlistItems = [] } = useQuery<(WishlistItem & { product: Product })[]>({
    queryKey: ["/api/wishlist"], 
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: "Men", value: "men" },
    { name: "Women", value: "women" },
    { name: "Kids", value: "kids" },
    { name: "Accessories", value: "accessories" },
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-sm text-center">
        <span className="font-medium">Free Shipping on orders above ₹999 | Use code: FREESHIP</span>
      </div>

      {/* Main Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-2" data-testid="link-logo">
                  <div className="bg-primary text-primary-foreground rounded-lg p-2">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-primary">StyleHub</span>
                </div>
              </Link>

              {/* Main Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {categories.map((category) => (
                  <DropdownMenu key={category.value}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-1" data-testid={`button-menu-${category.value}`}>
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/products?category=${category.value}`}>
                          All {category.name}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products?category=${category.value}&subcategory=shirts`}>
                          Shirts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products?category=${category.value}&subcategory=pants`}>
                          Pants
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products?category=${category.value}&subcategory=shoes`}>
                          Shoes
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
                <Link href="/products?sale=true">
                  <Button variant="ghost" className="font-medium text-accent hover:text-accent/80" data-testid="link-sale">
                    Sale
                  </Button>
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for clothing, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary pr-12"
                  data-testid="input-search"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Track Order */}
              <Link href="/track">
                <Button variant="ghost" className="hidden lg:flex items-center space-x-2" data-testid="button-track">
                  <Truck className="w-5 h-5" />
                  <span className="font-medium">Track</span>
                </Button>
              </Link>

              {/* Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-account">
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline font-medium">
                      {isAuthenticated ? user?.firstName || 'Account' : 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      {user?.isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <a href="/api/logout">Logout</a>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <a href="/api/login">Login</a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              {isAuthenticated && (
                <Button variant="ghost" className="relative" data-testid="button-wishlist">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                className="relative" 
                onClick={() => setShowCart(true)}
                data-testid="button-cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="lg:hidden" data-testid="button-mobile-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <div className="space-y-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-12"
                        data-testid="input-mobile-search"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="space-y-4">
                      {categories.map((category) => (
                        <Link 
                          key={category.value} 
                          href={`/products?category=${category.value}`}
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Button variant="ghost" className="w-full justify-start text-lg" data-testid={`link-mobile-${category.value}`}>
                            {category.name}
                          </Button>
                        </Link>
                      ))}
                      <Link href="/products?sale=true" onClick={() => setShowMobileMenu(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg text-accent">
                          Sale
                        </Button>
                      </Link>
                      <Link href="/track" onClick={() => setShowMobileMenu(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          Track Order
                        </Button>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar open={showCart} onOpenChange={setShowCart} />
    </>
  );
}
