#!/bin/bash

# Setup git alias for instant deployment
# Run this once to configure git deploy alias

echo "🔧 Setting up git deploy alias..."
echo ""

# Add git alias (global)
git config --global alias.deploy '!bash scripts/deploy.sh'

echo -e "✅ Git alias 'git deploy' configured"
echo ""

echo "📖 Usage Examples:"
echo ""
echo "  # Deploy with default message"
echo "  git deploy 'feat: Add new feature'"
echo ""
echo "  # Or just use the deploy script directly"
echo "  bash scripts/deploy.sh 'fix: Resolve bug'"
echo ""
echo "✨ Now you can use: git deploy 'your message' to commit AND deploy!"
echo ""
