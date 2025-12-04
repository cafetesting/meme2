#!/bin/bash

# Google OAuth Setup Script for Supabase
# This script helps you set up Google OAuth environment variables

echo "🔐 Google OAuth Setup for Supabase"
echo "===================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo "📋 Before running this script, make sure you have:"
echo "   1. Created a Google Cloud Project"
echo "   2. Configured OAuth consent screen"
echo "   3. Created OAuth 2.0 credentials"
echo "   4. Added redirect URIs:"
echo "      - http://localhost:54321/auth/v1/callback"
echo "      - http://localhost:3000/auth/callback"
echo ""
read -p "Do you have your Google Client ID and Secret ready? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📖 Please follow the guide in GOOGLE_OAUTH_SETUP.md first"
    exit 0
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
echo "Setting environment variables..."

# Export variables
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="$CLIENT_ID"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="$CLIENT_SECRET"

echo "✅ Environment variables set!"
echo ""
echo "Client ID: $CLIENT_ID"
echo "Client Secret: ${CLIENT_SECRET:0:10}..." # Show only first 10 chars for security
echo ""

# Check if Supabase is running
if supabase status &> /dev/null; then
    echo "⚠️  Supabase is currently running."
    echo "   You need to restart it for the changes to take effect."
    echo ""
    read -p "Restart Supabase now? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🔄 Stopping Supabase..."
        supabase stop
        
        echo "🚀 Starting Supabase..."
        supabase start
        
        echo ""
        echo "✅ Supabase restarted with Google OAuth configuration!"
        echo ""
        echo "📝 Note: These environment variables are only set for this terminal session."
        echo ""
        read -p "Make these variables permanent? (adds to ~/.zshrc) (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "🔄 Running permanent setup script..."
            ./setup-permanent-env.sh
        else
            echo ""
            echo "💡 To make them permanent later, run: ./setup-permanent-env.sh"
        fi
    else
        echo ""
        echo "⚠️  Remember to restart Supabase manually:"
        echo "   supabase stop && supabase start"
    fi
else
    echo "ℹ️  Supabase is not running."
    echo "   Start it with: supabase start"
fi

echo ""
echo "✨ Setup complete! Test Google OAuth at http://localhost:3000/login"

