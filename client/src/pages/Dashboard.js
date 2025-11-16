import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userAPI.getProfile();
        setPortfolio(response.data.portfolio);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navigation />
      
      <div className="dashboard-header">
        <div style={{ maxInlineSize: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#2b2f36' }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p style={{ color: '#5b636b', fontSize: '16px' }}>
            Here's what's happening with your portfolio today
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Portfolio Overview */}
        <div className="dashboard-card">
          <h2>Portfolio</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', insetBlockEnd: '24px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2b2f36' }}>
                ${portfolio?.balance?.toFixed(2) || '0.00'}
              </div>
              <div style={{ color: '#5b636b' }}>Total balance</div>
            </div>
            <div style={{ color: '#05d168', fontWeight: '600' }}>
              +$0.00 (0.00%) today
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-primary">Buy crypto</button>
            <button className="btn btn-secondary">Sell crypto</button>
            <button className="btn btn-outline">Send</button>
            <button className="btn btn-outline">Receive</button>
          </div>
        </div>

        {/* Assets */}
        <div className="dashboard-card">
          <h2>Your assets</h2>
          {portfolio?.assets?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Balance</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.assets.map((asset, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: '#0052ff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700'
                        }}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{asset.name}</div>
                          <div style={{ color: '#5b636b', fontSize: '14px' }}>{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td>{asset.amount} {asset.symbol}</td>
                    <td>${asset.avgPrice?.toFixed(2) || '0.00'}</td>
                    <td style={{ color: '#05d168' }}>+2.4%</td>
                    <td>${(asset.amount * (asset.avgPrice || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
              <p>You don't own any crypto yet</p>
              <button className="btn btn-primary" style={{ insetBlockStart: '16px' }}>
                Buy your first crypto
              </button>
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="dashboard-card">
          <h2>Market overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', insetBlockEnd: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f7931a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>₿</div>
                <span style={{ fontWeight: '600' }}>Bitcoin</span>
              </div>
              <div className="stat-value" style={{ fontSize: '24px' }}>$45,230</div>
              <div style={{ color: '#05d168', fontWeight: '600' }}>+2.4%</div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#627eea', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Ξ</div>
                <span style={{ fontWeight: '600' }}>Ethereum</span>
              </div>
              <div className="stat-value" style={{ fontSize: '24px' }}>$2,845</div>
              <div style={{ color: '#05d168', fontWeight: '600' }}>+1.8%</div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#c2a633', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Ð</div>
                <span style={{ fontWeight: '600' }}>Dogecoin</span>
              </div>
              <div className="stat-value" style={{ fontSize: '24px' }}>$0.08</div>
              <div style={{ color: '#f05350', fontWeight: '600' }}>-0.5%</div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: '#9945ff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>⚡</div>
                <span style={{ fontWeight: '600' }}>Solana</span>
              </div>
              <div className="stat-value" style={{ fontSize: '24px' }}>$98.45</div>
              <div style={{ color: '#05d168', fontWeight: '600' }}>+5.2%</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2>Recent activity</h2>
          <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
            <p>No recent activity</p>
            <p style={{ fontSize: '14px' }}>Your transactions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;