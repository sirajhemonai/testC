# 🚀 Vercel Deployment Guide for SellSpark

## ✅ Project Status: VERCEL-READY

Your project has been fully optimized for Vercel deployment with:
- Modern Vercel configuration (v2)
- Serverless API functions
- Proper TypeScript compilation
- CORS configuration for production
- Health check endpoint

## 📋 Pre-Deployment Checklist

✅ **vercel.json** - Configured with latest Vercel settings
✅ **api/index.ts** - Serverless function handler optimized
✅ **api/tsconfig.json** - TypeScript configuration for API
✅ **Build settings** - Properly configured for Vite + API
✅ **CORS** - Production-ready CORS configuration
✅ **Health check** - Available at `/api/health`

## 🔧 Configuration Details

### vercel.json Configuration
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### Key Features:
- **Version 2**: Latest Vercel configuration format
- **Runtime**: Uses latest @vercel/node (auto-updated by Vercel)
- **Node.js**: Runs on Node.js 20.x by default
- **Max Duration**: 30 seconds for API functions
- **Rewrites**: Proper routing for API and static files

## 📦 Deployment Steps

### Option 1: Deploy via GitHub (Recommended)

1. **Download the project**:
   - Click Files → ⋮ → Download as ZIP

2. **Push to GitHub**:
   ```bash
   cd CoachLeadApp
   chmod +x deploy-to-github.sh
   ./deploy-to-github.sh
   ```

3. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import from GitHub: https://github.com/sirajhemonai/CoachLeadApp
   - Vercel will auto-detect the configuration
   - Configure environment variables (see below)
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔐 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required:
```
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
BRIGHTDATA_API_KEY=your_brightdata_key
```

### Optional:
```
GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY={...json...}
SENDGRID_API_KEY=your_sendgrid_key
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
```

## 🏗️ Project Structure

```
CoachLeadApp/
├── api/
│   ├── index.ts         # Vercel serverless function
│   └── tsconfig.json    # TypeScript config for API
├── client/              # React frontend
├── server/              # Express backend services
├── dist/
│   └── public/          # Built frontend (outputDirectory)
└── vercel.json          # Vercel configuration
```

## 🔍 API Endpoints

### Health Check
```
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

### Main API Routes
- `/api/consult` - Consultation endpoints
- `/api/submit-website` - Website submission
- `/api/chat` - Chat functionality
- `/api/business-analysis` - AI analysis
- `/api/ask-question` - AI questioning
- `/api/sessions/export` - Export sessions

## 🐛 Troubleshooting

### Build Errors
- Vercel automatically runs `npm install` and `npm run build`
- Check build logs in Vercel dashboard

### API Not Working
- Verify environment variables are set
- Check function logs in Vercel dashboard
- Test health endpoint: `your-domain.vercel.app/api/health`

### CORS Issues
- CORS is pre-configured for all origins
- Credentials are enabled for authenticated requests

### TypeScript Errors
- API has its own tsconfig.json
- Vercel uses Node.js runtime with TypeScript support

## ✨ Features Configured

1. **Serverless Functions**: API runs as serverless functions
2. **Static Site**: Frontend served from CDN
3. **Auto-scaling**: Vercel handles scaling automatically
4. **SSL/TLS**: Automatic HTTPS certificates
5. **Custom Domain**: Can be configured in Vercel dashboard
6. **Preview Deployments**: Automatic for each git push

## 📊 Performance Optimizations

- **CDN**: Static files served from global CDN
- **Serverless**: API functions scale automatically
- **Caching**: Proper cache headers configured
- **Compression**: Automatic gzip/brotli compression
- **Image Optimization**: Vercel optimizes images automatically

## 🎯 Post-Deployment

1. **Test the deployment**:
   - Visit: `your-app.vercel.app`
   - Check API: `your-app.vercel.app/api/health`

2. **Monitor**:
   - View logs in Vercel dashboard
   - Set up error tracking (optional)
   - Monitor performance metrics

3. **Custom Domain**:
   - Add custom domain in Vercel dashboard
   - Configure DNS settings
   - SSL certificate auto-configured

## 📝 Notes

- **No version errors**: Configuration uses Vercel v2 format
- **No deprecated features**: Uses modern `rewrites` instead of `routes`
- **TypeScript ready**: Full TypeScript support in API
- **Production ready**: All optimizations configured

## 🆘 Support

If you encounter any issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test API health endpoint
4. Review function logs in Vercel dashboard

Your project is now fully configured for Vercel deployment! 🎉