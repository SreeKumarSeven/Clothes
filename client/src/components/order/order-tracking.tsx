import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  AlertCircle
} from "lucide-react";

interface OrderTrackingProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderTracking({ orderId, onClose }: OrderTrackingProps) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`;
    
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
    <Dialog open={!!orderId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Order Tracking</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">
                We couldn't find the details for this order. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {order && !isLoading && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Order #{order.orderNumber}</h3>
                    <p className="text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="text-sm px-3 py-1"
                    data-testid="order-status-badge"
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Total Amount: <span className="font-medium text-foreground">₹{parseFloat(order.totalAmount).toLocaleString()}</span></p>
                  {order.estimatedDelivery && (
                    <p>Expected Delivery: <span className="font-medium text-foreground">{new Date(order.estimatedDelivery).toLocaleDateString()}</span></p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Progress */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-6">Tracking Progress</h4>
                
                <div className="space-y-4">
                  {/* Progress Steps */}
                  <div className="flex justify-between relative">
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                    <div 
                      className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
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
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isActive 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'bg-background border-border'
                            }`}
                            data-testid={`tracking-step-${step.status}`}
                          >
                            {getStatusIcon(step.status, isActive)}
                          </div>
                          <p className={`mt-2 text-xs font-medium text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-primary font-medium mt-1">Current</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Events */}
            {order.tracking && order.tracking.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Tracking History</h4>
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
                            <h5 className="font-medium text-foreground">
                              {getStatusLabel(event.status)}
                            </h5>
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
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">
                    Items in this order ({order.orderItems.length})
                  </h4>
                  <div className="space-y-4">
                    {order.orderItems.map((item: any, index: number) => (
                      <div key={item.id} className="flex space-x-4" data-testid={`order-item-${index}`}>
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">{item.product.name}</h5>
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
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.pincode}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
