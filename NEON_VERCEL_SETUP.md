# Neon Database + Vercel Setup Guide

## Step 1: Create Neon Database

1. **Sign up for Neon**
   - Go to https://neon.tech
   - Click "Sign up" (free tier available)
   - Sign in with GitHub, Google, or email

2. **Create a New Project**
   - Click "Create a project"
   - Choose project name (e.g., "sellspark-db")
   - Select region closest to your users
   - Click "Create project"

3. **Get Connection Details**
   - After creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   - Copy this entire string - this is your DATABASE_URL

4. **Copy the Connection String**
   - The full connection string is all you need
   - It contains all connection details in one URL
   - Save this for your environment variables

## Step 2: Test Database Locally

1. **Update your local .env file**:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   PGHOST=ep-xxx.region.aws.neon.tech
   PGDATABASE=neondb
   PGUSER=your-username
   PGPASSWORD=your-password
   PGPORT=5432
   ```

2. **Initialize your database schema**:
   ```bash
   npm run db:push
   ```

## Step 3: Connect to Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

2. **Add Database Variables**
   Add this single environment variable:
   
   | Key | Value |
   |-----|-------|
   | DATABASE_URL | `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require` |
   
   **Note**: The individual PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT variables are NOT needed for this project. Your app uses `@neondatabase/serverless` which only requires the DATABASE_URL.

3. **Add Other Required Variables**
   Don't forget to add your AI service keys:
   
   | Key | Value |
   |-----|-------|
   | GEMINI_API_KEY | `your-gemini-key` |
   | PERPLEXITY_API_KEY | `your-perplexity-key` |
   | BRIGHTDATA_API_KEY | `your-brightdata-key` |

4. **Optional Variables** (if using these features):
   
   | Key | Value |
   |-----|-------|
   | GOOGLE_SERVICE_ACCOUNT_KEY | `{entire JSON object}` |
   | PINECONE_API_KEY | `your-pinecone-key` |
   | VITE_STRIPE_PUBLIC_KEY | `pk_test_xxx` |
   | STRIPE_SECRET_KEY | `sk_test_xxx` |

## Step 4: Deploy to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Neon database configuration"
   git push origin main
   ```

2. **Deploy from Vercel**:
   - Vercel will automatically deploy when you push
   - Or manually trigger deployment from Vercel dashboard

3. **Initialize Production Database**:
   - After deployment, your app will automatically connect to Neon
   - The database schema will be created on first run

## Step 5: Verify Connection

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Look for successful database connection logs

2. **Test Your Application**:
   - Visit your deployed site
   - Test features that use the database
   - Check for any errors in browser console

## Troubleshooting

### Connection Timeout
- Ensure you're using `?sslmode=require` in DATABASE_URL
- Check if your IP is whitelisted (Neon allows all IPs by default)

### Schema Not Created
- Run database migrations locally first:
  ```bash
  npm run db:push
  ```
- Check Vercel function logs for migration errors

### Environment Variables Not Working
- Ensure no spaces in variable values
- Redeploy after adding environment variables
- Check variable names match exactly

## Neon Dashboard Features

- **SQL Editor**: Run queries directly in Neon dashboard
- **Tables View**: Browse your data visually
- **Monitoring**: Track database performance
- **Branching**: Create database branches for testing

## Cost Considerations

### Neon Free Tier Includes:
- 0.5 GB storage
- 1 compute unit
- Unlimited projects
- Perfect for small to medium apps

### When to Upgrade:
- Need more than 0.5 GB storage
- Require better performance
- Need dedicated resources

## Security Best Practices

1. **Never commit .env files**
2. **Use different databases for dev/prod**
3. **Enable SSL (already done with sslmode=require)**
4. **Regularly rotate passwords**
5. **Monitor database access logs**