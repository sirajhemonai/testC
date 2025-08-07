#!/bin/bash

# Git Push Fix Script for SellSpark
echo "🔧 Git Push Fix Script"
echo "======================"

# Check if CoachLeadApp repository exists
echo "📌 Checking repository status..."
git remote -v

echo ""
echo "Choose an option:"
echo "1) Force push to CoachLeadApp (overwrites remote)"
echo "2) Create new repository push"
echo "3) Clean push (recommended)"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "⚠️  Force pushing to CoachLeadApp..."
        git push --force origin main
        ;;
    2)
        echo "🔄 Setting up new repository..."
        git remote remove origin 2>/dev/null
        read -p "Enter new repository name (e.g., leadApp2): " repo_name
        git remote add origin https://github.com/sirajhemonai/$repo_name.git
        echo "📤 Pushing to new repository..."
        git push -u origin main
        ;;
    3)
        echo "🧹 Performing clean push..."
        
        # Backup current state
        echo "📦 Creating backup..."
        git branch backup-main 2>/dev/null
        
        # Fetch and merge
        echo "📥 Fetching remote changes..."
        git fetch origin
        
        # Reset to remote state and reapply local changes
        echo "🔄 Syncing with remote..."
        git reset --soft origin/main
        git add .
        git commit -m "Updated SellSpark - Vercel-ready deployment"
        
        echo "📤 Pushing changes..."
        git push origin main
        ;;
esac

echo ""
echo "✅ Script completed!"
echo ""
echo "If push still fails, try these manual steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote set-url origin https://github.com/sirajhemonai/[new-repo-name].git"
echo "3. Run: git push --force origin main"