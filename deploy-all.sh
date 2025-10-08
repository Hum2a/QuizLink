#!/usr/bin/env bash

# Complete deployment script for QuizLink
# Deploys both backend and frontend

set -e  # Exit on error

echo "🚀 QuizLink Complete Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Step 1: Deploy Backend
echo "📦 Step 1: Deploying Backend (Cloudflare Workers)..."
echo ""

cd workers

if [ ! -f "package.json" ]; then
    echo "❌ Error: workers/package.json not found"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Deploying worker..."
npm run deploy

echo "✅ Backend deployed successfully!"
echo ""

cd ..

# Step 2: Deploy Frontend
echo "📦 Step 2: Deploying Frontend (Cloudflare Pages)..."
echo ""

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build:prod

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=quizlink --commit-dirty=true

echo "✅ Frontend deployed successfully!"
echo ""

# Success!
echo "================================"
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Your app is live at:"
echo "   https://quizlink.pages.dev"
echo ""
echo "🔌 API endpoint:"
echo "   https://quizlink-api.humzab1711.workers.dev"
echo ""
echo "📊 View logs:"
echo "   cd workers && wrangler tail"
echo ""

