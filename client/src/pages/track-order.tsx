import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Search,
  AlertCircle
} from "lucide-react";

export default function TrackOrder() {
  const [location] = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Parse URL parameters
  useState(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const orderParam = params.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
      setSearchAttempted(true);
    }
  });

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/track", orderNumber],
    enabled: !!orderNumber && searchAttempted,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchAttempted(true);
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`;
    
    switch (status) {
      case "pending":
      case "confirmed":
        return <Clock className={iconClass} />;
      case "shipped":
        return <Package className={iconClass} />;
      case "out_for_delivery":
        return <Truck className={iconClass} />;
      case "delivered":
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Placed";
      case "confirmed":
        return "Order Confirmed";
      case "shipped":
        return "Shipped";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const trackingSteps = [
    { status: "pending", label: "Order Placed" },
    { status: "confirmed", label: "Order Confirmed" },
    { status: "shipped", label: "Shipped" },
    { status: "out_for_delivery", label: "Out for Delivery" },
    { status: "delivered", label: "Delivered" },
  ];

  const getCurrentStepIndex = (currentStatus: string) => {
    return trackingSteps.findIndex(step => step.status === currentStatus);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">Track Your Order</h1>
            <p className="text-lg text-muted-foreground">
              Enter your order number to get real-time tracking information
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter order number (e.g., ORD-1234567890)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                  data-testid="input-order-number"
                />
                <Button type="submit" disabled={!orderNumber.trim()} data-testid="button-track-order">
                  <Search className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for your order...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && searchAttempted && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find an order with the number "{orderNumber}". 
                  Please check the order number and try again.
                </p>
                <p className="text-sm text-muted-foreground">
                  Order numbers usually start with "ORD-" followed by numbers and letters.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Found */}
          {order && !isLoading && (
            <div className="space-y-8">
              {/* Order Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
                      <p className="text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className="text-lg px-4 py-2"
                      data-testid="text-order-status"
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Tracking Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Progress Steps */}
                    <div className="flex justify-between relative">
                      <div className="absolute top-6 left-6 right-6 h-0.5 bg-border" />
                      <div 
                        className="absolute top-6 left-6 h-0.5 bg-primary transition-all duration-500"
                        style={{ 
                          width: `${(getCurrentStepIndex(order.status) / (trackingSteps.length - 1)) * 100}%` 
                        }}
                      />
                      
                      {trackingSteps.map((step, index) => {
                        const isActive = getCurrentStepIndex(order.status) >= index;
                        const isCurrent = order.status === step.status;
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center relative z-10">
                            <div 
                              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isActive 
                                  ? 'bg-primary border-primary text-primary-foreground' 
                                  : 'bg-background border-border'
                              }`}
                              data-testid={`step-${step.status}`}
                            >
                              {getStatusIcon(step.status, isActive)}
                            </div>
                            <p className={`mt-2 text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-primary font-medium mt-1">Current</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Tracking Events */}
                    {order.tracking && order.tracking.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Tracking History</h3>
                        <div className="space-y-4">
                          {order.tracking.map((event: any, index: number) => (
                            <div key={event.id} className="flex space-x-4" data-testid={`tracking-event-${index}`}>
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  {getStatusIcon(event.status, true)}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-foreground">
                                    {getStatusLabel(event.status)}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                {event.message && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.message}</p>
                                )}
                                {event.location && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">{event.location}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                        <p>{order.shippingAddress?.address}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                        <p>{order.shippingAddress?.pincode}</p>
                        <p>{order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="capitalize">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Status:</span>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        {order.estimatedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Delivery:</span>
                            <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Items ({order.orderItems?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {order.orderItems?.map((item: any, index: number) => (
                        <div key={item.id} className="flex space-x-4" data-testid={`order-item-${index}`}>
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                            <div className="flex items-center space-x-4 mt-1">
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
                              <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                              <span className="font-medium">₹{parseFloat(item.price).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about your order, feel free to contact our support team.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">Contact Support</Button>
                  <Button variant="outline">Track via SMS</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
