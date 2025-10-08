# PowerShell script to set up environment files
# Run this with: .\setup-env-files.ps1

Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan

# Create .env.local
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists" -ForegroundColor Yellow
} else {
    Copy-Item "env.local.template" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
}

# Create .env.production template (user will update this)
if (Test-Path ".env.production") {
    Write-Host "⚠️  .env.production already exists" -ForegroundColor Yellow
} else {
    Copy-Item "env.production.template" ".env.production"
    Write-Host "✅ Created .env.production (update with your worker URL!)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. For local dev: You're all set! Just run 'npm run dev'" -ForegroundColor White
Write-Host "2. For production: Edit .env.production and add your worker URL" -ForegroundColor White
Write-Host ""
Write-Host "See ENV_SETUP_GUIDE.md for detailed instructions!" -ForegroundColor Cyan

