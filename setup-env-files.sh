#!/bin/bash
# Bash script to set up environment files
# Run this with: chmod +x setup-env-files.sh && ./setup-env-files.sh

echo "🔧 Setting up environment files..."

# Create .env.local
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists"
else
    cp env.local.template .env.local
    echo "✅ Created .env.local"
fi

# Create .env.production template (user will update this)
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists"
else
    cp env.production.template .env.production
    echo "✅ Created .env.production (update with your worker URL!)"
fi

echo ""
echo "📝 Next steps:"
echo "1. For local dev: You're all set! Just run 'npm run dev'"
echo "2. For production: Edit .env.production and add your worker URL"
echo ""
echo "See ENV_SETUP_GUIDE.md for detailed instructions!"

