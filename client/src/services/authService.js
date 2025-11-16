// Google OAuth Configuration
export const googleAuthConfig = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
  scope: 'email profile',
  redirectUri: `${window.location.origin}/auth/google/callback`
};

// Apple Sign In Configuration
export const appleAuthConfig = {
  clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'your-apple-client-id',
  scope: 'name email',
  redirectUri: `${window.location.origin}/auth/apple/callback`,
  state: Math.random().toString(36).substring(7)
};

// Google OAuth Sign In
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    // For demo purposes, simulate OAuth flow
    const confirmed = window.confirm(
      '🚀 Google OAuth Integration Ready!\n\n' +
      'In production, this would:\n' +
      '• Open Google OAuth popup\n' +
      '• Handle authentication\n' +
      '• Return user data\n' +
      '• Create account automatically\n\n' +
      'Click OK to simulate successful Google sign-in'
    );
    
    if (confirmed) {
      // Simulate successful Google auth response
      setTimeout(() => {
        resolve({
          success: true,
          user: {
            id: 'google_' + Date.now(),
            email: 'user@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            profilePicture: 'https://via.placeholder.com/150',
            provider: 'google'
          },
          token: 'google_auth_token_' + Date.now()
        });
      }, 1000);
    } else {
      reject(new Error('Google sign-in cancelled'));
    }
  });
};

// Apple ID Sign In
export const signInWithApple = () => {
  return new Promise((resolve, reject) => {
    // For demo purposes, simulate Apple ID flow
    const confirmed = window.confirm(
      '🍎 Apple ID Integration Ready!\n\n' +
      'In production, this would:\n' +
      '• Use Apple JS SDK\n' +
      '• Handle Apple ID authentication\n' +
      '• Process encrypted user data\n' +
      '• Create secure account\n\n' +
      'Click OK to simulate successful Apple ID sign-in'
    );
    
    if (confirmed) {
      // Simulate successful Apple auth response
      setTimeout(() => {
        resolve({
          success: true,
          user: {
            id: 'apple_' + Date.now(),
            email: 'user@icloud.com',
            firstName: 'Jane',
            lastName: 'Smith',
            profilePicture: null,
            provider: 'apple'
          },
          token: 'apple_auth_token_' + Date.now()
        });
      }, 1000);
    } else {
      reject(new Error('Apple ID sign-in cancelled'));
    }
  });
};

// Recovery Phrase Sign In
export const signInWithRecoveryPhrase = () => {
  return new Promise((resolve, reject) => {
    // Recovery phrase input dialog
    const recoveryPhrase = window.prompt(
      '🔐 Recovery Phrase Sign In\n\n' +
      'Enter your 12-word recovery phrase (separated by spaces):\n' +
      'Example: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12\n\n' +
      'For demo, enter: demo recovery phrase test wallet secure crypto blockchain coinbase platform user account'
    );
    
    if (recoveryPhrase) {
      const words = recoveryPhrase.trim().split(' ');
      
      // Validate recovery phrase format
      if (words.length !== 12) {
        reject(new Error('Recovery phrase must be exactly 12 words'));
        return;
      }
      
      // Demo validation - check for specific phrase
      const demoPhrase = 'demo recovery phrase test wallet secure crypto blockchain coinbase platform user account';
      if (recoveryPhrase.toLowerCase().trim() === demoPhrase) {
        setTimeout(() => {
          resolve({
            success: true,
            user: {
              id: 'recovery_' + Date.now(),
              email: 'recovered@coinbase.com',
              firstName: 'Recovered',
              lastName: 'User',
              profilePicture: null,
              provider: 'recovery_phrase',
              wallet: {
                address: '0x742d35cc6bf8532573a9b9c42b8a1e23dc0a8d9f',
                balance: 1.25,
                assets: [
                  { symbol: 'BTC', name: 'Bitcoin', amount: 0.025, avgPrice: 45230 },
                  { symbol: 'ETH', name: 'Ethereum', amount: 0.5, avgPrice: 2845 }
                ]
              }
            },
            token: 'recovery_auth_token_' + Date.now()
          });
        }, 1500);
      } else {
        reject(new Error('Invalid recovery phrase. Please check your phrase and try again.'));
      }
    } else {
      reject(new Error('Recovery phrase sign-in cancelled'));
    }
  });
};

// Recovery Phrase Generation (for new accounts)
export const generateRecoveryPhrase = () => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
    'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
    'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
    'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing'
  ];
  
  // Generate 12 random words
  const phrase = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    phrase.push(words[randomIndex]);
  }
  
  return phrase.join(' ');
};