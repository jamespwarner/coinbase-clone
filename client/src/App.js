import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import StoreFront from './pages/StoreFront';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminTest from './pages/AdminTest';
import GoogleAuth from './pages/GoogleAuth';
import AppleAuth from './pages/AppleAuth';
import RecoveryAuth from './pages/RecoveryAuth';

// Global Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<StoreFront />} />
            <Route path="/secure" element={<HomePage />} />
            <Route path="/secure/signin" element={<SignIn />} />
            <Route path="/secure/signup" element={<SignUp />} />
            <Route path="/secure/auth/google" element={<GoogleAuth />} />
            <Route path="/secure/auth/apple" element={<AppleAuth />} />
            <Route path="/secure/auth/recovery" element={<RecoveryAuth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/test" element={<AdminTest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
