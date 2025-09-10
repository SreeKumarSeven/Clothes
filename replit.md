# Overview

This is a full-stack e-commerce platform called "StyleHub" built with a modern tech stack. The application provides a comprehensive online clothing store with user authentication, product management, shopping cart functionality, order processing, payment integration, and administrative features. It's designed as a single-page application (SPA) with a React frontend and Express.js backend, featuring a clean, modern UI built with Tailwind CSS and shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with separate routes for authenticated and unauthenticated users
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication Flow**: Conditional rendering based on authentication status with automatic redirects

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful API with consistent error handling and request/response logging
- **Authentication**: Replit Auth integration using OpenID Connect with session-based authentication
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **File Structure**: Modular architecture with separate routing, storage, and database layers

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle ORM with migration support
- **Key Entities**: Users, Products, Orders, Cart Items, Wishlist, Reviews, Order Tracking
- **Session Storage**: Dedicated sessions table for authentication state persistence
- **Relationships**: Proper foreign key relationships between users, products, orders, and related entities

## Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Security**: HTTPS-only cookies with proper session expiration
- **Access Control**: Route-level authentication checks with automatic login redirects
- **User Management**: Mandatory user storage integration for Replit Auth compliance

## API Structure
- **Product Management**: CRUD operations for products with category filtering and search
- **Cart Operations**: Add/remove items, quantity updates, persistent cart state
- **Order Processing**: Order creation, tracking, and status updates
- **User Features**: Wishlist management, order history, user profile
- **Admin Features**: Product management, order fulfillment, analytics dashboard

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Auth**: Integrated authentication service using OpenID Connect
- **Stripe**: Payment processing integration for checkout and transactions

## Development Tools
- **Vite**: Fast build tool and development server with Hot Module Replacement
- **TypeScript**: Type safety across the entire application stack
- **Drizzle Kit**: Database migration and schema management tools

## UI/UX Libraries
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Performant form handling with minimal re-renders

## Data Management
- **TanStack Query**: Server state management with intelligent caching
- **Zod**: Runtime type validation for forms and API responses
- **Date-fns**: Date manipulation and formatting utilities

## Production Infrastructure
- **ESBuild**: Fast JavaScript bundler for production builds
- **Express Session**: Session middleware with PostgreSQL persistence
- **Replit Platform**: Deployment and hosting environment with development tooling