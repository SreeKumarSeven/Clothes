import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  category: z.enum(["men", "women", "kids", "accessories"]),
  subcategory: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  salePrice: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  images: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  stock: z.string().min(1, "Stock is required"),
  isFeatured: z.boolean().default(false),
  tags: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { limit: 100 }],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "men",
      subcategory: "",
      price: "",
      salePrice: "",
      imageUrl: "",
      images: "",
      sizes: "",
      colors: "",
      stock: "",
      isFeatured: false,
      tags: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const productData = {
        ...data,
        price: data.price,
        salePrice: data.salePrice || null,
        stock: parseInt(data.stock),
        images: data.images ? data.images.split(",").map(img => img.trim()) : [],
        sizes: data.sizes ? data.sizes.split(",").map(size => size.trim()) : [],
        colors: data.colors ? data.colors.split(",").map(color => color.trim()) : [],
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      };
      
      if (editingProduct) {
        return apiRequest("PUT", `/api/products/${editingProduct.id}`, productData);
      } else {
        return apiRequest("POST", "/api/products", productData);
      }
    },
    onSuccess: () => {
      toast({
        title: editingProduct ? "Product Updated" : "Product Created",
        description: `Product has been ${editingProduct ? "updated" : "created"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductDialog(false);
      setEditingProduct(null);
      form.reset();
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
        description: `Failed to ${editingProduct ? "update" : "create"} product.`,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
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
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory || "",
      price: product.price,
      salePrice: product.salePrice || "",
      imageUrl: product.imageUrl,
      images: product.images?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      stock: product.stock?.toString() || "0",
      isFeatured: product.isFeatured || false,
      tags: product.tags?.join(", ") || "",
    });
    setShowProductDialog(true);
  };

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0);
  const pendingOrders = orders.filter((order: any) => order.status === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((product: any) => product.stock < 10).length;

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Badge variant="secondary" className="text-sm">
            Administrator
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-revenue">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-orders">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-chart-2/10 p-3 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-products">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-orders">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-destructive/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" data-testid="tab-products">Products Management</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders Management</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products</CardTitle>
                  <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setEditingProduct(null);
                          form.reset();
                        }}
                        data-testid="button-add-product"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={form.handleSubmit((data) => createProductMutation.mutate(data))} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              {...form.register("name")}
                              data-testid="input-product-name"
                            />
                            {form.formState.errors.name && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.name.message}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                              id="brand"
                              {...form.register("brand")}
                              data-testid="input-product-brand"
                            />
                            {form.formState.errors.brand && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.brand.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...form.register("description")}
                            data-testid="textarea-product-description"
                          />
                          {form.formState.errors.description && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.description.message}
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              value={form.watch("category")} 
                              onValueChange={(value) => form.setValue("category", value as any)}
                            >
                              <SelectTrigger data-testid="select-product-category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="subcategory">Subcategory</Label>
                            <Input
                              id="subcategory"
                              {...form.register("subcategory")}
                              placeholder="e.g., shirts, pants, shoes"
                              data-testid="input-product-subcategory"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              {...form.register("price")}
                              data-testid="input-product-price"
                            />
                            {form.formState.errors.price && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.price.message}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="salePrice">Sale Price (₹)</Label>
                            <Input
                              id="salePrice"
                              {...form.register("salePrice")}
                              placeholder="Optional"
                              data-testid="input-product-sale-price"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                              id="stock"
                              type="number"
                              {...form.register("stock")}
                              data-testid="input-product-stock"
                            />
                            {form.formState.errors.stock && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.stock.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="imageUrl">Main Image URL</Label>
                          <Input
                            id="imageUrl"
                            {...form.register("imageUrl")}
                            placeholder="https://example.com/image.jpg"
                            data-testid="input-product-image-url"
                          />
                          {form.formState.errors.imageUrl && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.imageUrl.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="images">Additional Images (comma-separated URLs)</Label>
                          <Input
                            id="images"
                            {...form.register("images")}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            data-testid="input-product-images"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                            <Input
                              id="sizes"
                              {...form.register("sizes")}
                              placeholder="XS, S, M, L, XL"
                              data-testid="input-product-sizes"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="colors">Colors (comma-separated)</Label>
                            <Input
                              id="colors"
                              {...form.register("colors")}
                              placeholder="Red, Blue, Green"
                              data-testid="input-product-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="tags">Tags (comma-separated)</Label>
                          <Input
                            id="tags"
                            {...form.register("tags")}
                            placeholder="trending, sale, new"
                            data-testid="input-product-tags"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isFeatured"
                            {...form.register("isFeatured")}
                            className="rounded"
                            data-testid="checkbox-product-featured"
                          />
                          <Label htmlFor="isFeatured">Featured Product</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowProductDialog(false)}
                            data-testid="button-cancel-product"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createProductMutation.isPending}
                            data-testid="button-save-product"
                          >
                            {createProductMutation.isPending 
                              ? "Saving..." 
                              : editingProduct ? "Update Product" : "Create Product"
                            }
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any, index: number) => (
                      <TableRow key={product.id} data-testid={`row-product-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{parseFloat(product.price).toLocaleString()}</p>
                            {product.salePrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                ₹{parseFloat(product.salePrice).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                            {product.stock} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.isFeatured && <Badge className="mr-2">Featured</Badge>}
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              data-testid={`button-edit-product-${index}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                              data-testid={`button-delete-product-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 20).map((order: any, index: number) => (
                      <TableRow key={order.id} data-testid={`row-order-${index}`}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatusMutation.mutate({ orderId: order.id, status: value })}
                          >
                            <SelectTrigger className="w-40" data-testid={`select-order-status-${index}`}>
                              <SelectValue>
                                <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                                  {getStatusIcon(order.status)}
                                  <span className="capitalize">{order.status.replace('_', ' ')}</span>
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/orders/${order.id}`, '_blank')}
                            data-testid={`button-view-order-${index}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
