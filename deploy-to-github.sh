#!/bin/bash

# SellSpark - Deploy to GitHub Script
# Run this script in your local terminal after copying the project files

echo "🚀 SellSpark - GitHub Deployment Script"
echo "========================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/sirajhemonai/CoachLeadApp.git
else
    echo "✅ Git repository detected"
fi

# Clean up any Replit-specific files
echo "🧹 Cleaning up Replit-specific files..."
rm -rf .replit .cache .local .upm 2>/dev/null

# Add all files
echo "📝 Adding all files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Complete SellSpark project with TypeScript fixes for Vercel deployment

- Fixed all TypeScript compilation errors
- Updated Vercel configuration with correct runtime
- Added @types/pdf-parse for PDF processing
- Fixed storage interface compliance
- Updated Gemini AI service calls
- Ready for production deployment"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment Complete!"
echo "Your SellSpark project is now on GitHub and ready for Vercel deployment."
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Configure environment variables (see ENV_VARIABLES_GUIDE.md)"
echo "4. Deploy!"