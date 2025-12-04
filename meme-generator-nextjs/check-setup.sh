#!/bin/bash

# Diagnostic script to check setup issues

echo "🔍 Meme Generator Setup Diagnostic"
echo "==================================="
echo ""

# Check if Supabase containers are running
echo "1. Checking Supabase containers..."
if docker ps | grep -q supabase_kong_meme-generator-nextjs; then
    echo "   ✅ Supabase containers are running"
    
    # Get Supabase URL (default localhost)
    SUPABASE_URL="http://127.0.0.1:54321"
    echo "   📍 Supabase URL: $SUPABASE_URL"
else
    echo "   ❌ Supabase containers are not running"
    echo "   💡 Run: cd meme-generator-nextjs && supabase start"
    exit 1
fi

# Check for .env.local file
echo ""
echo "2. Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "   ✅ NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo "   ❌ NEXT_PUBLIC_SUPABASE_URL is missing"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    fi
else
    echo "   ❌ .env.local file does not exist"
    echo "   💡 This is required for Next.js to connect to Supabase"
fi

# Check for Google OAuth env vars
echo ""
echo "3. Checking Google OAuth environment variables..."
if grep -q "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" ~/.zshrc 2>/dev/null || [ -n "$SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" ]; then
    echo "   ✅ Google OAuth Client ID is configured"
else
    echo "   ⚠️  Google OAuth Client ID is not set"
    echo "   💡 Run: ./setup-permanent-env.sh"
fi

if grep -q "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" ~/.zshrc 2>/dev/null || [ -n "$SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" ]; then
    echo "   ✅ Google OAuth Secret is configured"
else
    echo "   ⚠️  Google OAuth Secret is not set"
    echo "   💡 Run: ./setup-permanent-env.sh"
fi

# Check if Supabase API is accessible
echo ""
echo "4. Testing Supabase API connection..."
if curl -s "$SUPABASE_URL/rest/v1/" > /dev/null 2>&1; then
    echo "   ✅ Supabase API is accessible"
else
    echo "   ❌ Cannot connect to Supabase API"
    echo "   💡 Check if Supabase is running: docker ps | grep supabase"
fi

# Check Next.js dependencies
echo ""
echo "5. Checking Next.js setup..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ⚠️  node_modules not found"
    echo "   💡 Run: npm install"
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
else
    echo "   ❌ package.json not found"
fi

echo ""
echo "==================================="
echo "📋 Summary:"
echo ""
echo "If .env.local is missing, you need to:"
echo "1. Get Supabase credentials (run 'supabase status' if CLI is available)"
echo "2. Create .env.local with:"
echo "   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>"
echo ""
echo "For Google OAuth setup:"
echo "1. Complete Google Cloud Console setup"
echo "2. Run: ./setup-permanent-env.sh"
echo "3. Restart Supabase: supabase stop && supabase start"

