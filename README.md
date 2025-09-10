# DressMart - Fashion E-commerce Platform

A modern, full-stack e-commerce platform built with React, TypeScript, Express, and PostgreSQL.

## Features

- 🛍️ **Product Catalog** - Browse and search through fashion items
- 🛒 **Shopping Cart** - Add items to cart with size/color selection
- 📦 **Order Management** - Track orders with real-time updates
- 👤 **User Authentication** - Secure login with Replit Auth
- ❤️ **Wishlist** - Save favorite items for later
- ⭐ **Reviews & Ratings** - Customer feedback system
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd DressMart
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.template .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/dressmart

# Replit Auth Configuration
REPLIT_DOMAINS=localhost:5000,127.0.0.1:5000
REPL_ID=your-repl-id-here
ISSUER_URL=https://replit.com/oidc

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

Create a PostgreSQL database and run migrations:

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

### 4. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### 5. Production Build

```bash
npm run build
npm start
```

## Project Structure

```
DressMart/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── replitAuth.ts      # Authentication setup
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── migrations/            # Database migration files
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

### Reviews
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add product review

## Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **products** - Product catalog with variants
- **cart_items** - Shopping cart items
- **orders** - Order information
- **order_items** - Individual items in orders
- **order_tracking** - Order status tracking
- **wishlist** - User wishlist items
- **reviews** - Product reviews and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.
