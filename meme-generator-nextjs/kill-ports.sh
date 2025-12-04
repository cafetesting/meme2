#!/bin/bash

# Script to kill processes on ports 3000 and 3001

echo "🔪 Killing processes on ports 3000 and 3001"
echo "============================================"
echo ""

# Find and kill process on port 3000
PORT_3000_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_3000_PID" ]; then
    echo "📌 Found process on port 3000 (PID: $PORT_3000_PID)"
    ps -p $PORT_3000_PID -o pid,command
    kill -9 $PORT_3000_PID 2>/dev/null
    echo "   ✅ Killed process on port 3000"
else
    echo "   ℹ️  No process found on port 3000"
fi

echo ""

# Find and kill process on port 3001
PORT_3001_PID=$(lsof -ti:3001 2>/dev/null)
if [ -n "$PORT_3001_PID" ]; then
    echo "📌 Found process on port 3001 (PID: $PORT_3001_PID)"
    ps -p $PORT_3001_PID -o pid,command
    kill -9 $PORT_3001_PID 2>/dev/null
    echo "   ✅ Killed process on port 3001"
else
    echo "   ℹ️  No process found on port 3001"
fi

echo ""
echo "✅ Done! Ports 3000 and 3001 should now be free."
echo ""
echo "💡 Verify ports are free:"
echo "   lsof -i:3000 -i:3001"

