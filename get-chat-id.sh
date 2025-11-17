#!/bin/bash

# Alternative Telegram Chat ID Finder
# This script helps you find your Telegram Chat ID

echo "🔍 Telegram Chat ID Finder"
echo "=========================="
echo ""

# Check if bot token is provided
if [ -z "$1" ]; then
    echo "❌ Error: Bot token required"
    echo ""
    echo "Usage: ./get-chat-id.sh YOUR_BOT_TOKEN"
    echo ""
    echo "Example:"
    echo "  ./get-chat-id.sh 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
    echo ""
    echo "To get your bot token:"
    echo "  1. Open Telegram"
    echo "  2. Search for @BotFather"
    echo "  3. Send /newbot and follow instructions"
    echo "  4. Copy the token BotFather gives you"
    exit 1
fi

BOT_TOKEN=$1

echo "📋 Using Bot Token: ${BOT_TOKEN:0:20}..."
echo ""

# Test if bot is valid
echo "🧪 Step 1: Checking if bot token is valid..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")

if echo "$BOT_INFO" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Bot is valid!"
    echo "   📛 Name: $BOT_NAME"
    echo "   👤 Username: @$BOT_USERNAME"
    echo ""
else
    echo "   ❌ Bot token is invalid!"
    echo "   Response: $BOT_INFO"
    exit 1
fi

# Try to get updates
echo "🔍 Step 2: Looking for your Chat ID..."
echo ""
echo "⚠️  IMPORTANT: Before continuing, you MUST:"
echo "   1. Open Telegram on your phone/computer"
echo "   2. Search for: @$BOT_USERNAME"
echo "   3. Click 'START' button (or send /start)"
echo "   4. Send ANY message to the bot (e.g., 'hello')"
echo ""
read -p "Have you sent a message to the bot? (yes/no): " answer

if [ "$answer" != "yes" ]; then
    echo ""
    echo "❌ Please send a message to @$BOT_USERNAME first, then run this script again."
    exit 1
fi

echo ""
echo "🔄 Fetching chat updates..."

UPDATES=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates")

# Check if we got any updates
if echo "$UPDATES" | grep -q '"chat"'; then
    echo "   ✅ Found chat data!"
    echo ""
    
    # Extract chat ID (try multiple methods)
    CHAT_ID=$(echo "$UPDATES" | grep -o '"chat":{"id":[0-9-]*' | grep -o '[0-9-]*$' | head -1)
    
    if [ -z "$CHAT_ID" ]; then
        # Try alternative extraction
        CHAT_ID=$(echo "$UPDATES" | grep -o '"id":[0-9-]*' | grep -o '[0-9-]*' | head -1)
    fi
    
    if [ -n "$CHAT_ID" ]; then
        echo "🎉 SUCCESS! Your Chat ID is: $CHAT_ID"
        echo ""
        echo "📋 Next Steps:"
        echo "   1. Add these to Railway environment variables:"
        echo ""
        echo "      TELEGRAM_BOT_TOKEN=$BOT_TOKEN"
        echo "      TELEGRAM_CHAT_ID=$CHAT_ID"
        echo ""
        echo "   2. Go to: https://railway.app/"
        echo "   3. Select your backend project"
        echo "   4. Click 'Variables' tab"
        echo "   5. Click 'New Variable' and add both"
        echo ""
        echo "🧪 Test your bot now:"
        TEST_MESSAGE="🎉 Test message from Chat ID finder!%0A%0AYour chat ID is: $CHAT_ID"
        TEST_RESULT=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${TEST_MESSAGE}")
        
        if echo "$TEST_RESULT" | grep -q '"ok":true'; then
            echo "   ✅ Test message sent! Check your Telegram!"
        else
            echo "   ⚠️  Could not send test message, but Chat ID should be correct"
        fi
    else
        echo "❌ Could not extract Chat ID from response"
        echo ""
        echo "Raw response:"
        echo "$UPDATES"
    fi
else
    echo "   ❌ No chat data found!"
    echo ""
    echo "💡 This usually means:"
    echo "   1. You haven't sent a message to the bot yet"
    echo "   2. You haven't clicked 'START' in the bot chat"
    echo ""
    echo "📱 Please do this now:"
    echo "   1. Open Telegram"
    echo "   2. Search for: @$BOT_USERNAME"
    echo "   3. Click 'START' button"
    echo "   4. Send any message (like 'hello')"
    echo "   5. Run this script again"
    echo ""
    echo "🔍 Raw response (for debugging):"
    echo "$UPDATES"
fi
