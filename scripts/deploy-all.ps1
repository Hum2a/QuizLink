# Complete deployment script for QuizLink
# Deploys both backend and frontend

Write-Host "🚀 QuizLink Complete Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Deploy Backend
Write-Host "📦 Step 1: Deploying Backend (Cloudflare Workers)..." -ForegroundColor Yellow
Write-Host ""

cd workers

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: workers/package.json not found" -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor White
npm install

Write-Host "Deploying worker..." -ForegroundColor White
npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host ""

cd ..

# Step 2: Deploy Frontend
Write-Host "📦 Step 2: Deploying Frontend (Cloudflare Pages)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor White
npm install

Write-Host "Building frontend..." -ForegroundColor White
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor White
npx wrangler pages deploy dist --project-name=quizlink --commit-dirty=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Success!
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is live at:" -ForegroundColor Cyan
Write-Host "   https://quizlink.pages.dev" -ForegroundColor White
Write-Host ""
Write-Host "🔌 API endpoint:" -ForegroundColor Cyan
Write-Host "   https://quizlink-api.humzab1711.workers.dev" -ForegroundColor White
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   cd workers && wrangler tail" -ForegroundColor White
Write-Host ""

