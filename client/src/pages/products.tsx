import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Search, X, Grid, List } from "lucide-react";

export default function Products() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    setSearchQuery(params.get('search') || '');
    setCategory(params.get('category') || '');
    setSubcategory(params.get('subcategory') || '');
    setSortBy(params.get('sort') || 'newest');
  }, [location]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { category, search: searchQuery, limit: 50 }],
  });

  const categories = [
    { value: "", label: "All Categories" },
    { value: "men", label: "Men's Wear" },
    { value: "women", label: "Women's Wear" },
    { value: "kids", label: "Kids Wear" },
    { value: "accessories", label: "Accessories" },
  ];

  const subcategories = [
    { value: "", label: "All Items" },
    { value: "shirts", label: "Shirts" },
    { value: "pants", label: "Pants" },
    { value: "dresses", label: "Dresses" },
    { value: "shoes", label: "Shoes" },
    { value: "bags", label: "Bags" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Navy", "Gray", "Red", "Blue", "Green", "Pink"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries({ category, subcategory, search: searchQuery, sort: sortBy, ...newFilters })
      .forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    navigate(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setSubcategory("");
    setSortBy("newest");
    setPriceRange([0, 10000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    navigate("/products");
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesPrice = parseFloat(product.price) >= priceRange[0] && parseFloat(product.price) <= priceRange[1];
    const matchesSize = selectedSizes.length === 0 || selectedSizes.some(size => product.sizes?.includes(size));
    const matchesColor = selectedColors.length === 0 || selectedColors.some(color => product.colors?.includes(color));
    return matchesPrice && matchesSize && matchesColor;
  });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case "price_low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price_high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-products"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  data-testid="button-search-products"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
                data-testid="button-toggle-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); updateFilters({ sort: value }); }}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(category || subcategory || searchQuery || selectedSizes.length || selectedColors.length) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {category && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Category: {categories.find(c => c.value === category)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setCategory(""); updateFilters({ category: "" }); }} />
                </Badge>
              )}
              {subcategory && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Type: {subcategories.find(s => s.value === subcategory)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setSubcategory(""); updateFilters({ subcategory: "" }); }} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearchQuery(""); updateFilters({ search: "" }); }} />
                </Badge>
              )}
              {selectedSizes.map(size => (
                <Badge key={size} variant="secondary" className="flex items-center gap-2">
                  Size: {size}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))} />
                </Badge>
              ))}
              {selectedColors.map(color => (
                <Badge key={color} variant="secondary" className="flex items-center gap-2">
                  Color: {color}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColors(prev => prev.filter(c => c !== color))} />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} w-full lg:w-64 space-y-6`}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Category</h3>
                  <Select value={category} onValueChange={(value) => { setCategory(value); updateFilters({ category: value }); }}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Type</h3>
                  <Select value={subcategory} onValueChange={(value) => { setSubcategory(value); updateFilters({ subcategory: value }); }}>
                    <SelectTrigger data-testid="select-subcategory">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(subcat => (
                        <SelectItem key={subcat.value} value={subcat.value}>{subcat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      step={100}
                      className="w-full"
                      data-testid="slider-price-range"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map(size => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSizes(prev => [...prev, size]);
                            } else {
                              setSelectedSizes(prev => prev.filter(s => s !== size));
                            }
                          }}
                          data-testid={`checkbox-size-${size}`}
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Color</h3>
                  <div className="space-y-2">
                    {colors.map(color => (
                      <div key={color} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color}`}
                          checked={selectedColors.includes(color)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedColors(prev => [...prev, color]);
                            } else {
                              setSelectedColors(prev => prev.filter(c => c !== color));
                            }
                          }}
                          data-testid={`checkbox-color-${color}`}
                        />
                        <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {sortedProducts.length} of {products.length} products
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <ProductGrid products={sortedProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
