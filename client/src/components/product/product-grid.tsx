import { useQuery } from "@tanstack/react-query";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  excludeId?: string;
  products?: any[];
  viewMode?: "grid" | "list";
  className?: string;
}

export default function ProductGrid({
  category,
  search,
  featured,
  limit,
  offset,
  excludeId,
  products: providedProducts,
  viewMode = "grid",
  className = "",
}: ProductGridProps) {
  const { data: fetchedProducts = [], isLoading } = useQuery({
    queryKey: ["/api/products", { category, search, featured, limit, offset }],
    enabled: !providedProducts,
  });

  const products = providedProducts || fetchedProducts;
  const filteredProducts = excludeId 
    ? products.filter((product: any) => product.id !== excludeId)
    : products;

  if (isLoading && !providedProducts) {
    return (
      <div className={`${
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
      } ${className}`}>
        {Array.from({ length: limit || 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className={viewMode === "grid" ? "h-64 w-full" : "h-32 w-32"} />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">No products found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div 
      className={`${
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-4"
      } ${className}`}
      data-testid="product-grid"
    >
      {filteredProducts.map((product: any, index: number) => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          data-testid={`product-card-${index}`}
        />
      ))}
    </div>
  );
}
