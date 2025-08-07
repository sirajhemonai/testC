# Complete Environment Variables Guide

Copy these into your `.env` file:

```env
# Database (PostgreSQL - Neon or other provider)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Note: Individual PG* variables are NOT needed for this project
# Your app uses @neondatabase/serverless which only requires DATABASE_URL

# AI Services (Required)
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
BRIGHTDATA_API_KEY=your_brightdata_api_key

# Email Service (Currently hardcoded in emailService.ts)
# You can modify the email service to use these instead:
SMTP_HOST=smtp.maileroo.com
SMTP_PORT=587
SMTP_USER=webinfo@dac855e7e99f76e0.maileroo.org
SMTP_PASS=1af7d5423a9f51abbbada4a1

# Google Sheets Integration (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Pinecone Vector Database (Optional)
PINECONE_API_KEY=your_pinecone_api_key

# Stripe Payment Processing (Optional)
VITE_STRIPE_PUBLIC_KEY=pk_live_or_test_xxx
STRIPE_SECRET_KEY=sk_live_or_test_xxx
STRIPE_PRICE_ID=price_xxx

# SendGrid Email (Optional - alternative to SMTP)
SENDGRID_API_KEY=SG.xxx

# Webhook Configuration (Optional)
VITE_WEBHOOK_URL=https://your-webhook-url.com
VITE_MAKE_API_KEY=your_make_api_key
```

## Where to Get Each Key:

### 1. **Database (PostgreSQL)**
- If using Replit: Already provided in your environment
- External: Get from your database provider (Neon, Supabase, etc.)

### 2. **GEMINI_API_KEY** (Required)
- Go to: https://makersuite.google.com/app/apikey
- Create a new API key
- Free tier available

### 3. **PERPLEXITY_API_KEY** (Required)
- Go to: https://perplexity.ai/api
- Sign up and get API key
- Pricing: https://docs.perplexity.ai/docs/pricing

### 4. **BRIGHTDATA_API_KEY** (Required)
- Go to: https://brightdata.com
- Sign up for Web Scraper API
- Get your API key from dashboard

### 5. **GOOGLE_SERVICE_ACCOUNT_KEY** (Optional)
- Go to: https://console.cloud.google.com
- Create a new project
- Enable Google Sheets API
- Create service account credentials
- Download JSON key file

### 6. **PINECONE_API_KEY** (Optional)
- Go to: https://www.pinecone.io
- Sign up for free account
- Get API key from dashboard

### 7. **Stripe Keys** (Optional)
- Go to: https://dashboard.stripe.com/apikeys
- Get Publishable key (VITE_STRIPE_PUBLIC_KEY)
- Get Secret key (STRIPE_SECRET_KEY)
- Create a price in Products section (STRIPE_PRICE_ID)

### 8. **SENDGRID_API_KEY** (Optional)
- Go to: https://app.sendgrid.com
- Sign up for account
- Create API key in Settings

## For Local Development:
Create a `.env` file in your project root and paste the variables above with your actual values.

## For Production (Vercel):
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable one by one
4. Deploy your project