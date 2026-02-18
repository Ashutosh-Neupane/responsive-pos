#!/bin/bash

# Sudha Nepali POS - GitHub & Vercel Deployment Script
# Run this script to push to GitHub and deploy to Vercel

echo "🚀 Sudha Nepali POS - Deployment Script"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Please run 'git init' first."
    exit 1
fi

# Get GitHub username
echo "📝 Enter your GitHub username:"
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Repository name
REPO_NAME="sudha-nepali-pos"

echo ""
echo "📦 Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "⚠️  Make sure you've created the repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo ""
read -p "Press Enter when repository is created..."

# Add remote
echo ""
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "   Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "   Please check your credentials and try again"
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🚀 Ready to deploy to Vercel?"
echo "   Option 1: Use Vercel Dashboard (Recommended)"
echo "   Option 2: Use Vercel CLI"
echo ""
read -p "Deploy with Vercel CLI? (y/n): " DEPLOY_VERCEL

if [ "$DEPLOY_VERCEL" = "y" ] || [ "$DEPLOY_VERCEL" = "Y" ]; then
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo ""
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully deployed to Vercel!"
    else
        echo ""
        echo "❌ Deployment failed. Please try manually."
    fi
else
    echo ""
    echo "📋 Manual Deployment Steps:"
    echo "   1. Go to https://vercel.com"
    echo "   2. Click 'Add New Project'"
    echo "   3. Import: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "   4. Click 'Deploy'"
    echo ""
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📚 Next Steps:"
echo "   - View on GitHub: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "   - View on Vercel: https://vercel.com"
echo "   - Test your deployment"
echo "   - Share with users!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
