import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OrderTracking from "@/components/order/order-tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, X } from "lucide-react";

export default function Orders() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (isLoading || ordersLoading) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Package className="w-4 h-4" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeOrders = orders.filter((order: any) => 
    !["delivered", "cancelled"].includes(order.status)
  );

  const completedOrders = orders.filter((order: any) => 
    ["delivered", "cancelled"].includes(order.status)
  );

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">No Orders Yet</h1>
            <p className="text-muted-foreground mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link href="/products">
              <Button size="lg" data-testid="button-start-shopping">
                Start Shopping
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
          <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" data-testid="tab-active-orders">
                Active Orders ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed-orders">
                Completed Orders ({completedOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-8">
              <div className="space-y-6">
                {activeOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Orders</h3>
                      <p className="text-muted-foreground">All your orders have been completed or cancelled.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeOrders.map((order: any, index: number) => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`card-active-order-${index}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="grid gap-3">
                          {order.orderItems?.slice(0, 2).map((item: any, itemIndex: number) => (
                            <div key={item.id} className="flex space-x-3" data-testid={`order-item-${index}-${itemIndex}`}>
                              <Link href={`/product/${item.product.id}`}>
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              </Link>
                              <div className="flex-1">
                                <Link href={`/product/${item.product.id}`}>
                                  <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                                    {item.product.name}
                                  </h4>
                                </Link>
                                <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex space-x-2">
                                    {item.size && (
                                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Color: {item.color}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="font-medium">₹{parseFloat(item.price).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.orderItems?.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              Total: ₹{parseFloat(order.totalAmount).toLocaleString()}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-sm text-muted-foreground">
                                Expected delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedOrder(order.id)}
                              data-testid={`button-track-order-${index}`}
                            >
                              Track Order
                            </Button>
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="default" data-testid={`button-view-details-${index}`}>
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-8">
              <div className="space-y-6">
                {completedOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Orders</h3>
                      <p className="text-muted-foreground">Your completed orders will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedOrders.map((order: any, index: number) => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`card-completed-order-${index}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Order Items */}
                        <div className="grid gap-3">
                          {order.orderItems?.slice(0, 2).map((item: any, itemIndex: number) => (
                            <div key={item.id} className="flex space-x-3" data-testid={`completed-order-item-${index}-${itemIndex}`}>
                              <Link href={`/product/${item.product.id}`}>
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              </Link>
                              <div className="flex-1">
                                <Link href={`/product/${item.product.id}`}>
                                  <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                                    {item.product.name}
                                  </h4>
                                </Link>
                                <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex space-x-2">
                                    {item.size && (
                                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Color: {item.color}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="font-medium">₹{parseFloat(item.price).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.orderItems?.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              Total: ₹{parseFloat(order.totalAmount).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.status === "delivered" ? "Delivered" : "Cancelled"} on{" "}
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {order.status === "delivered" && (
                              <Link href={`/product/${order.orderItems[0]?.product.id}#reviews`}>
                                <Button variant="outline" data-testid={`button-write-review-${index}`}>
                                  Write Review
                                </Button>
                              </Link>
                            )}
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="default" data-testid={`button-view-completed-details-${index}`}>
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <OrderTracking
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <Footer />
    </div>
  );
}
