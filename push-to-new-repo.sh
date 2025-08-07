#!/bin/bash

echo "🚀 Push to New GitHub Repository"
echo "================================="
echo ""

# Get the new repository name
read -p "Enter your new GitHub repository name: " REPO_NAME
echo ""

echo "📌 Step 1: Removing old remote..."
git remote remove origin 2>/dev/null

echo "📌 Step 2: Adding new remote..."
git remote add origin https://github.com/sirajhemonai/$REPO_NAME.git

echo "📌 Step 3: Verifying remote..."
git remote -v
echo ""

echo "📌 Step 4: Checking git status..."
git status
echo ""

echo "📌 Step 5: Creating fresh commit..."
git add -A
git commit -m "Initial commit - SellSpark AI Automation Platform" --allow-empty
echo ""

echo "📌 Step 6: Pushing to new repository..."
echo "Attempting push..."
git push -u origin main 2>&1

# Check if push failed
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Push failed. Trying alternative branch..."
    git branch -M main
    git push -u origin main --force
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Push still failed. Trying master branch..."
        git branch -M master
        git push -u origin master --force
    fi
fi

echo ""
echo "✅ Script completed!"
echo ""
echo "Your repository URL: https://github.com/sirajhemonai/$REPO_NAME"