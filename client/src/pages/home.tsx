import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, Heart, Clock, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: wishlistItems } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Welcome Section */}
      <section className="py-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Welcome back, {user?.firstName || 'Fashion Lover'}!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover new arrivals, track your orders, and continue your style journey.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow" data-testid="card-orders">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">My Orders</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {recentOrders?.length || 0} orders
                  </p>
                  <Link href="/orders">
                    <Button variant="outline" size="sm" data-testid="button-view-orders">
                      View All
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="card-wishlist">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-destructive mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Wishlist</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {wishlistItems?.length || 0} items
                  </p>
                  <Link href="/products?wishlist=true">
                    <Button variant="outline" size="sm" data-testid="button-view-wishlist">
                      View All
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="card-track">
                <CardContent className="p-6 text-center">
                  <Truck className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Track Order</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time updates
                  </p>
                  <Link href="/track">
                    <Button variant="outline" size="sm" data-testid="button-track-order">
                      Track Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="card-account">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-chart-2 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Quick Shop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on history
                  </p>
                  <Link href="/products?recommended=true">
                    <Button variant="outline" size="sm" data-testid="button-quick-shop">
                      Shop Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Recent Orders</h2>
              <Link href="/orders">
                <Button variant="outline" data-testid="button-view-all-orders">
                  View All Orders
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentOrders.slice(0, 3).map((order: any, index: number) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`card-recent-order-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-foreground">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground mb-4">
                      ₹{parseFloat(order.totalAmount).toLocaleString()}
                    </p>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="w-full" data-testid={`button-view-order-${index}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Recommended for You</h2>
              <p className="text-muted-foreground">Curated based on your preferences</p>
            </div>
            <Link href="/products">
              <Button variant="outline" data-testid="button-view-all-products">
                View All
              </Button>
            </Link>
          </div>
          <ProductGrid featured={true} limit={8} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Fresh styles just in</p>
            </div>
            <Link href="/products?sort=newest">
              <Button variant="outline" data-testid="button-view-new-arrivals">
                View All
              </Button>
            </Link>
          </div>
          <ProductGrid limit={4} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
