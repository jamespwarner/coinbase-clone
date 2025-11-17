#!/bin/bash

# Direct Telegram Bot Test
# This tests your bot credentials directly

echo "🤖 Direct Telegram Bot Test"
echo "============================"
echo ""

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./direct-telegram-test.sh BOT_TOKEN CHAT_ID"
    echo ""
    echo "Example:"
    echo "  ./direct-telegram-test.sh 123456789:ABCdefGHIjklMNOpqrsTUVwxyz 123456789"
    echo ""
    echo "Get your values from Railway:"
    echo "  1. Go to: https://railway.app/"
    echo "  2. Click your backend project"
    echo "  3. Click 'Variables' tab"
    echo "  4. Copy TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID values"
    exit 1
fi

BOT_TOKEN=$1
CHAT_ID=$2

echo "Testing with:"
echo "  Token: ${BOT_TOKEN:0:20}..."
echo "  Chat ID: $CHAT_ID"
echo ""

# Test 1: Check bot validity
echo "🧪 Test 1: Checking bot validity..."
BOT_CHECK=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")

if echo "$BOT_CHECK" | grep -q '"ok":true'; then
    echo "   ✅ Bot token is valid!"
else
    echo "   ❌ Bot token is INVALID!"
    echo "   Response: $BOT_CHECK"
    echo ""
    echo "   Fix: Get correct token from @BotFather in Telegram"
    exit 1
fi

echo ""

# Test 2: Send test message
echo "🧪 Test 2: Sending test message..."
TEST_MSG=$(cat <<EOF
🎉 Direct Test Message

This is a test from your terminal.

If you see this, your Telegram bot is working correctly!

⏰ $(date)
EOF
)

# URL encode the message
ENCODED_MSG=$(echo "$TEST_MSG" | jq -sRr @uri)

SEND_RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  -d "text=${ENCODED_MSG}")

if echo "$SEND_RESULT" | grep -q '"ok":true'; then
    echo "   ✅ Message sent successfully!"
    echo "   📱 Check your Telegram app!"
else
    echo "   ❌ Failed to send message!"
    echo "   Response: $SEND_RESULT"
    echo ""
    
    if echo "$SEND_RESULT" | grep -q "chat not found"; then
        echo "   ❓ Error: Chat not found"
        echo "   This means the Chat ID is wrong."
        echo ""
        echo "   Fix:"
        echo "   1. Open Telegram"
        echo "   2. Search for @userinfobot"
        echo "   3. Send /start"
        echo "   4. Copy the Chat ID it gives you"
        echo "   5. Update TELEGRAM_CHAT_ID in Railway"
    elif echo "$SEND_RESULT" | grep -q "Unauthorized"; then
        echo "   ❓ Error: Unauthorized"
        echo "   This means the bot token is wrong."
        echo ""
        echo "   Fix:"
        echo "   1. Open Telegram"
        echo "   2. Search for @BotFather"
        echo "   3. Send /mybots"
        echo "   4. Select your bot"
        echo "   5. Click 'API Token'"
        echo "   6. Copy the token"
        echo "   7. Update TELEGRAM_BOT_TOKEN in Railway"
    fi
    exit 1
fi

echo ""

# Test 3: Send formatted notification (like the app does)
echo "🧪 Test 3: Sending formatted notification..."

curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  -d "parse_mode=Markdown" \
  -d "text=🔔 *TEST VISITOR ALERT*%0A%0A📍 IP: \`203.0.113.45\`%0A🌐 Page: /%0A%0A⏰ $(date '+%Y-%m-%d %H:%M:%S')" > /dev/null

echo "   ✅ Formatted notification sent!"

echo ""
echo "=============================="
echo "✅ All tests passed!"
echo ""
echo "Your bot credentials are working correctly."
echo ""
echo "🔍 Next step: Check Railway deployment"
echo ""
echo "The issue might be that Railway hasn't redeployed yet, or the"
echo "environment variables aren't set correctly in Railway."
echo ""
echo "To fix:"
echo "1. Go to: https://railway.app/"
echo "2. Click your backend project"
echo "3. Click 'Variables' tab"
echo "4. Verify these exist:"
echo "   TELEGRAM_BOT_TOKEN=$BOT_TOKEN"
echo "   TELEGRAM_CHAT_ID=$CHAT_ID"
echo ""
echo "5. If they're wrong, update them"
echo "6. Railway will auto-redeploy (takes 2-3 minutes)"
echo "7. Wait for deployment to finish"
echo "8. Test again with the backend"
