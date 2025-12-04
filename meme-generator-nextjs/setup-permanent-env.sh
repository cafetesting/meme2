#!/bin/bash

# Script to set up permanent environment variables for Google OAuth
# This adds the variables to your ~/.zshrc file so they persist across sessions

echo "🔐 Permanent Environment Variables Setup"
echo "=========================================="
echo ""

# Check if ~/.zshrc exists, if not create it
if [ ! -f ~/.zshrc ]; then
    echo "📝 Creating ~/.zshrc file..."
    touch ~/.zshrc
fi

# Check if variables are already set
if grep -q "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" ~/.zshrc; then
    echo "⚠️  Google OAuth variables already exist in ~/.zshrc"
    echo ""
    read -p "Do you want to update them? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. No changes made."
        exit 0
    fi
    
    # Remove old entries
    echo "🗑️  Removing old entries..."
    sed -i.bak '/SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/d' ~/.zshrc
    sed -i.bak '/SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET/d' ~/.zshrc
fi

echo ""
echo "Enter your Google OAuth credentials:"
echo ""

# Get Client ID
read -p "Google Client ID: " CLIENT_ID
if [ -z "$CLIENT_ID" ]; then
    echo "❌ Client ID cannot be empty"
    exit 1
fi

# Get Client Secret
read -p "Google Client Secret: " CLIENT_SECRET
if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Client Secret cannot be empty"
    exit 1
fi

echo ""
echo "📝 Adding environment variables to ~/.zshrc..."

# Add a comment section for Google OAuth
cat >> ~/.zshrc << EOF

# Google OAuth for Supabase (Meme Generator)
# Added on $(date)
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="$CLIENT_ID"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="$CLIENT_SECRET"
EOF

echo "✅ Environment variables added to ~/.zshrc!"
echo ""
echo "🔄 Reloading shell configuration..."
source ~/.zshrc

echo ""
echo "✅ Permanent environment variables set up!"
echo ""
echo "📋 Summary:"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: ${CLIENT_SECRET:0:10}..."
echo ""
echo "✨ These variables will now be available in all new terminal sessions."
echo ""
echo "💡 To use them in your current terminal, run:"
echo "   source ~/.zshrc"
echo ""
echo "💡 To verify they're set, run:"
echo "   echo \$SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID"
echo "   echo \$SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET"

