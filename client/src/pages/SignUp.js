import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signInWithApple, signInWithRecoveryPhrase, generateRecoveryPhrase } from '../services/authService';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [socialLoading, setSocialLoading] = useState('');
  
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error when component mounts
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setFormErrors({});
    
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    navigate('/auth/google');
  };

  const handleAppleSignUp = async () => {
    navigate('/auth/apple');
  };

  const handleRecoveryPhraseImport = async () => {
    setSocialLoading('recovery');
    // Navigate to recovery phrase page
    navigate('/auth/recovery');
  };

  const handleGenerateWallet = () => {
    const newPhrase = generateRecoveryPhrase();
    const confirmed = window.confirm(
      '🆕 New Wallet Created!\n\n' +
      'Your recovery phrase is:\n\n' +
      `"${newPhrase}"\n\n` +
      '⚠️ IMPORTANT: Write this down and store it safely!\n' +
      'This is the ONLY way to recover your wallet.\n\n' +
      'Would you like to proceed with this wallet?'
    );
    
    if (confirmed) {
      // Create new account with generated wallet
      const newUser = {
        id: 'wallet_' + Date.now(),
        email: 'newwallet@coinbase.com',
        firstName: 'New',
        lastName: 'User',
        profilePicture: null,
        provider: 'new_wallet',
        wallet: {
          address: '0x' + Math.random().toString(16).substr(2, 40),
          recoveryPhrase: newPhrase,
          balance: 0,
          assets: []
        }
      };
      
      localStorage.setItem('token', 'new_wallet_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container">
        <div className="auth-header">
          <Link to="/" className="navbar-brand" style={{ marginBottom: '24px', display: 'block' }}>
            Coinbase
          </Link>
          <h1>Create your account</h1>
          <p>Join millions of users who trust Coinbase</p>
        </div>

        {/* Social Login Options */}
        <div style={{ marginBottom: '32px' }}>
          {/* Recovery Phrase Button - Highlighted and First */}
          <button
            type="button"
            className="btn btn-primary btn-full"
            style={{ 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              backgroundColor: '#0052FF',
              color: '#ffffff',
              border: '2px solid #0052FF',
              boxShadow: '0 4px 12px rgba(0, 82, 255, 0.25)',
              fontWeight: '600'
            }}
            onClick={handleRecoveryPhraseImport}
            disabled={socialLoading !== ''}
          >
            {socialLoading === 'recovery' ? (
              <div className="loading-spinner" style={{ width: '18px', height: '18px', margin: 0 }}></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
            )}
            {socialLoading === 'recovery' ? 'Importing...' : 'Import with recovery phrase'}
          </button>
          
          <button
            type="button"
            className="btn btn-outline btn-full"
            style={{ 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e6ebef'
            }}
            onClick={handleGoogleSignUp}
            disabled={socialLoading !== ''}
          >
            {socialLoading === 'google' ? (
              <div className="loading-spinner" style={{ width: '18px', height: '18px', margin: 0 }}></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {socialLoading === 'google' ? 'Creating account...' : 'Continue with Google'}
          </button>
          
          <button
            type="button"
            className="btn btn-outline btn-full"
            style={{ 
              marginBottom: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #000000'
            }}
            onClick={handleAppleSignUp}
            disabled={socialLoading !== ''}
          >
            {socialLoading === 'apple' ? (
              <div className="loading-spinner" style={{ width: '18px', height: '18px', margin: 0 }}></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            )}
            {socialLoading === 'apple' ? 'Creating account...' : 'Continue with Apple'}
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '24px 0',
            color: '#5b636b'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e6ebef' }}></div>
            <span style={{ padding: '0 16px', fontSize: '14px' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e6ebef' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName" className="form-label">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="First name"
                required
              />
              {formErrors.firstName && (
                <div className="form-error">{formErrors.firstName}</div>
              )}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName" className="form-label">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Last name"
                required
              />
              {formErrors.lastName && (
                <div className="form-error">{formErrors.lastName}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
            {formErrors.email && (
              <div className="form-error">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone number (optional)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a password"
              required
            />
            {formErrors.password && (
              <div className="form-error">{formErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              required
            />
            {formErrors.confirmPassword && (
              <div className="form-error">{formErrors.confirmPassword}</div>
            )}
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/signin">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;