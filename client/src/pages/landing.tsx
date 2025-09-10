import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useState } from "react";
import { Search, ShoppingBag, Truck, Heart, Star, CheckCircle } from "lucide-react";

export default function Landing() {
  const [trackingInput, setTrackingInput] = useState("");

  const categories = [
    {
      name: "Men's Wear",
      image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      count: "5000+ Products",
    },
    {
      name: "Women's Wear", 
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      count: "7500+ Products",
    },
    {
      name: "Kids Wear",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
      count: "2000+ Products",
    },
    {
      name: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      count: "1500+ Products",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing quality and fast delivery! The clothes fit perfectly and the customer service is outstanding.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b3e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      name: "Mike Chen", 
      rating: 5,
      comment: "Love the variety and quality. The tracking system is so convenient and the mobile app makes shopping easy.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
    {
      name: "Emma Davis",
      rating: 5, 
      comment: "Best online shopping experience! The return process is hassle-free and the clothes are exactly as shown.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Fashion That Speaks <span className="text-accent-foreground">Your Style</span>
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Discover the latest trends in clothing with fast delivery and easy returns. Shop from over 10,000+ styles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-4 text-lg" data-testid="button-shop-now">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-4 text-lg"
                    data-testid="button-view-collections"
                  >
                    View Collections
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=900" 
                alt="Fashion model wearing trendy outfit" 
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-card text-card-foreground p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Truck className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Fast Delivery</p>
                    <p className="text-sm text-muted-foreground">2-3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-lg text-muted-foreground">Explore our wide range of fashion categories</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/products?category=${category.name.toLowerCase().replace("'s", "").replace(" ", "_")}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-shadow" data-testid={`card-category-${index}`}>
                  <CardContent className="p-6 text-center">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                    <p className="text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Trending Now</h2>
              <p className="text-lg text-muted-foreground">Discover what's popular this season</p>
            </div>
          </div>
          <ProductGrid featured={true} limit={4} />
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="secondary" size="lg" data-testid="button-view-all">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Tracking */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Track Your Order</h2>
            <p className="text-lg text-muted-foreground">Real-time tracking for all your orders</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-6">Order Tracking</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order ID</label>
                  <Input 
                    placeholder="Enter your order ID" 
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    data-testid="input-order-id"
                  />
                </div>
                <Link href={trackingInput ? `/track?order=${trackingInput}` : "/track"}>
                  <Button className="w-full" size="lg" data-testid="button-track-order">
                    Track Order
                  </Button>
                </Link>
              </div>

              {/* Sample Tracking Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-full">
                      <CheckCircle className="text-primary-foreground w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">Order placed successfully</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-full">
                      <ShoppingBag className="text-primary-foreground w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Shipped</p>
                      <p className="text-sm text-muted-foreground">Package is on the way</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-full animate-pulse">
                      <Truck className="text-accent-foreground w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Out for Delivery</p>
                      <p className="text-sm text-muted-foreground">Expected delivery today</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-8">
              <img 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Delivery logistics and tracking" 
                className="rounded-2xl shadow-lg w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 text-center shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                    <Truck className="text-primary w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Fast Delivery</h4>
                  <p className="text-sm text-muted-foreground">2-3 business days</p>
                </Card>

                <Card className="p-6 text-center shadow-sm">
                  <div className="bg-chart-2/10 p-3 rounded-full w-fit mx-auto mb-3">
                    <CheckCircle className="text-chart-2 w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Easy Returns</h4>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">Join thousands of satisfied customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-sm" data-testid={`card-testimonial-${index}`}>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">Verified Buyer</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="bg-secondary/30 p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <p className="text-sm text-muted-foreground">Orders Delivered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4.8</div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">99%</div>
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile App Promotion */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Shop on the Go with Our Mobile App
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Get exclusive app-only deals, faster checkout, and real-time order tracking. Download now and save 15% on your first order!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-accent-foreground w-5 h-5" />
                  <span>Exclusive app-only discounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-accent-foreground w-5 h-5" />
                  <span>One-tap checkout and payment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-accent-foreground w-5 h-5" />
                  <span>Push notifications for order updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-accent-foreground w-5 h-5" />
                  <span>Virtual try-on with AR technology</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary" className="px-6 py-3 text-sm" data-testid="button-app-store">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">📱</div>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-bold">App Store</div>
                    </div>
                  </div>
                </Button>
                <Button variant="secondary" className="px-6 py-3 text-sm" data-testid="button-google-play">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">🤖</div>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-bold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800" 
                alt="Mobile app interface" 
                className="rounded-3xl shadow-2xl max-w-md mx-auto"
              />
              <div className="absolute -top-6 -left-6 bg-accent text-accent-foreground p-4 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">15%</div>
                  <div className="text-sm">OFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
