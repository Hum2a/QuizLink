# Pre-release checks for QuizLink (PowerShell version)
# Ensures everything is ready before creating a release

Write-Host "🔍 Running pre-release checks..." -ForegroundColor Cyan
Write-Host ""

# Check if on main/master branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  Warning: Not on main/master branch (current: $currentBranch)" -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "❌ Error: You have uncommitted changes" -ForegroundColor Red
    Write-Host ""
    git status --short
    Write-Host ""
    Write-Host "Please commit or stash changes before releasing" -ForegroundColor Yellow
    exit 1
}

# Run linter
Write-Host "🔍 Running linter..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed - fix errors before releasing" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Linting passed" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed - fix errors before releasing" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Check backend compiles
Write-Host "🔨 Checking backend..." -ForegroundColor Cyan
cd workers
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Worker type check failed" -ForegroundColor Red
    exit 1
}
cd ..
Write-Host "✅ Worker check passed" -ForegroundColor Green
Write-Host ""

# All checks passed
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ All pre-release checks passed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to create release! Run:" -ForegroundColor Yellow
Write-Host "  .\release.ps1 -Patch  (bug fixes)" -ForegroundColor White
Write-Host "  .\release.ps1 -Minor  (new features)" -ForegroundColor White
Write-Host "  .\release.ps1 -Major  (breaking changes)" -ForegroundColor White
Write-Host ""

