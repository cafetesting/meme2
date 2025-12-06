#!/bin/bash

# Script to restart Next.js and Supabase
# Usage: ./memerestart.sh or npm run memerestart

set -e

echo "🛑 Stopping existing services..."

# Stop Supabase if running
if command -v supabase &> /dev/null; then
	supabase stop 2>/dev/null || true
fi

# Kill Next.js dev server if running on port 3000
if lsof -ti:3000 &> /dev/null; then
	echo "   Stopping Next.js server on port 3000..."
	lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Wait a moment for processes to fully stop
sleep 2

echo "🚀 Starting Supabase and Next.js..."
echo ""

# Start Supabase and Next.js concurrently
npm run memestart

