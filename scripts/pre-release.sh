#!/usr/bin/env bash

# Pre-release checks for QuizLink
# Ensures everything is ready before creating a release

set -e

echo "🔍 Running pre-release checks..."
echo ""

# Check if on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "⚠️  Warning: Not on main/master branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Error: You have uncommitted changes"
    echo ""
    git status --short
    echo ""
    echo "Please commit or stash changes before releasing"
    exit 1
fi

# Run linter
echo "🔍 Running linter..."
npm run lint
if [[ $? -ne 0 ]]; then
    echo "❌ Linting failed - fix errors before releasing"
    exit 1
fi
echo "✅ Linting passed"
echo ""

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [[ $? -ne 0 ]]; then
    echo "❌ Build failed - fix errors before releasing"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Check backend compiles
echo "🔨 Checking backend..."
cd workers
npx tsc --noEmit
if [[ $? -ne 0 ]]; then
    echo "❌ Worker type check failed"
    exit 1
fi
cd ..
echo "✅ Worker check passed"
echo ""

# All checks passed
echo "================================"
echo "✅ All pre-release checks passed!"
echo "================================"
echo ""
echo "Ready to create release! Run:"
echo "  ./release.sh --patch  (bug fixes)"
echo "  ./release.sh --minor  (new features)"
echo "  ./release.sh --major  (breaking changes)"
echo ""

