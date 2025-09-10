# Vercel Deployment Guide for DressMart

This guide will help you deploy the DressMart e-commerce platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Use Vercel Postgres, Neon, or Supabase
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Prepare Your Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string

### Option B: External Database (Neon/Supabase)
1. Create a PostgreSQL database
2. Get the connection string
3. Ensure the database is accessible from Vercel

## Step 2: Deploy to Vercel

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add REPLIT_DOMAINS
vercel env add REPL_ID
```

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to Settings → Environment Variables and add:

### Required Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key-min-32-chars
REPLIT_DOMAINS=your-app.vercel.app
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
NODE_ENV=production
VERCEL=1
```

### Optional Variables
```
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 4: Database Setup

After deployment, you need to set up your database schema:

### Option 1: Using Vercel CLI
```bash
# Set DATABASE_URL in your local environment
export DATABASE_URL="your-database-url"

# Generate and push migrations
npx drizzle-kit generate
npx drizzle-kit push
```

### Option 2: Using Database Dashboard
1. Connect to your database using a tool like pgAdmin or DBeaver
2. Run the SQL commands from your schema file
3. Or use the database's web interface

## Step 5: Configure Authentication

### For Replit Auth:
1. Update `REPLIT_DOMAINS` to include your Vercel domain
2. Update `REPL_ID` with your Replit project ID
3. Configure OAuth redirect URLs in Replit

### For Custom Auth (Alternative):
If you want to use a different auth provider:
1. Update `server/replitAuth.ts` with your auth provider
2. Modify the auth routes accordingly

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test the following features:
   - User registration/login
   - Product browsing
   - Adding items to cart
   - Creating orders
   - Admin functions (if applicable)

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database accessibility
   - Ensure SSL is enabled if required

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

3. **Authentication Issues**
   - Verify REPLIT_DOMAINS includes your domain
   - Check OAuth redirect URLs
   - Ensure SESSION_SECRET is set

4. **API Route Issues**
   - Check Vercel function logs
   - Verify API routes are properly configured
   - Test endpoints individually

### Debugging:
```bash
# View function logs
vercel logs

# Check environment variables
vercel env ls

# Test locally with production environment
vercel dev
```

## Performance Optimization

1. **Enable Edge Functions** for API routes
2. **Use Vercel's CDN** for static assets
3. **Optimize images** with Vercel's Image Optimization
4. **Enable caching** for database queries

## Security Considerations

1. **Use HTTPS** (enabled by default on Vercel)
2. **Set secure cookies** for sessions
3. **Validate all inputs** on both client and server
4. **Use environment variables** for sensitive data
5. **Enable CORS** properly for API routes

## Monitoring

1. **Vercel Analytics** - Monitor performance
2. **Function logs** - Debug issues
3. **Database monitoring** - Track query performance
4. **Error tracking** - Use services like Sentry

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure CI/CD for automatic deployments
3. Set up monitoring and alerts
4. Implement backup strategies for your database
5. Consider implementing caching strategies

## Support

If you encounter issues:
1. Check Vercel's documentation
2. Review the function logs
3. Test locally with production environment variables
4. Contact Vercel support if needed
