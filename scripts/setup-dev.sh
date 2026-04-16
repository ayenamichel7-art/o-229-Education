#!/bin/bash

# 🎓 o-229 Education — Dev Environment Setup Script
# This script initializes Git hooks (Husky) and other dev tools.

echo "🚀 Initializing dev environment..."

# Ensure we are in the root directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# 1. Install root dependencies (Husky, lint-staged)
echo "📦 Installing development tools..."
npm install

# 2. Check if .git exists
if [ ! -d ".git" ]; then
    echo "⚠️ Warning: .git directory not found. Initializing git..."
    git init
fi

# 3. Initialize Husky
echo "🐶 Setting up Husky hooks..."
npx husky install

# 4. Create pre-commit hook if it doesn't exist
if [ ! -f ".husky/pre-commit" ]; then
    echo "📝 Creating pre-commit hook..."
    echo "npx lint-staged" > .husky/pre-commit
    chmod +x .husky/pre-commit
fi

echo "✅ Done! Git hooks are now active."
echo "💡 To start development, run: docker-compose up -d"
