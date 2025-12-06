#!/bin/bash

echo "🛑 Stopping all Meme Generator services..."
echo ""

# Stop Next.js (kill port 3000)
echo "📦 Stopping Next.js dev server..."
if lsof -ti:3000 > /dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "   ✅ Next.js stopped"
else
    echo "   ℹ️  Next.js was not running"
fi

# Stop Supabase
echo "📦 Stopping Supabase services..."
cd "$(dirname "$0")" || exit
if command -v supabase > /dev/null 2>&1; then
    /opt/homebrew/bin/supabase stop 2>/dev/null || supabase stop 2>/dev/null
    echo "   ✅ Supabase stopped"
else
    echo "   ⚠️  Supabase CLI not found"
fi

echo ""
echo "✅ All services stopped!"
echo ""
echo "Optional: Stop Docker Desktop manually if you want to free up resources"
echo "   (Right-click Docker icon in menu bar → Quit Docker Desktop)"

