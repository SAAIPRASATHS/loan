import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n/config';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import FinancialEducation from './pages/FinancialEducation';
import AgentDashboard from './pages/AgentDashboard';
import ApplyLoan from './pages/ApplyLoan';
import EMICalculator from './pages/EMICalculator';
import LoanComparison from './pages/LoanComparison';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  console.log('[PRIVATE ROUTE] User:', user);
  console.log('[PRIVATE ROUTE] Loading:', loading);
  console.log('[PRIVATE ROUTE] Required roles:', roles);
  console.log('[PRIVATE ROUTE] User role:', user?.role);

  if (loading) {
    console.log('[PRIVATE ROUTE] Still loading');
    return null;
  }

  if (!user) {
    console.log('[PRIVATE ROUTE] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('[PRIVATE ROUTE] Role mismatch, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[PRIVATE ROUTE] Access granted');
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/borrower/login" element={<Login role="borrower" />} />
      <Route path="/agent/login" element={<Login role="agent" />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardRedirect />
          </PrivateRoute>
        }
      />
      <Route
        path="/agent/dashboard"
        element={
          <PrivateRoute roles={['agent', 'admin']}>
            <AgentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      <Route
        path="/apply/:loanId"
        element={
          <PrivateRoute>
            <ApplyLoan />
          </PrivateRoute>
        }
      />
      <Route
        path="/emi-calculator"
        element={<EMICalculator />}
      />
      <Route
        path="/comparison"
        element={<LoanComparison />}
      />
      <Route path="/education" element={<FinancialEducation />} />
    </Routes>
  );
}

// Components
import Header from './components/Header';
import ChatFAB from './components/ChatFAB';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <AppRoutes />
            <ChatFAB />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function DashboardRedirect() {
  const { user, loading } = useAuth();

  console.log('[DASHBOARD REDIRECT] User:', user);
  console.log('[DASHBOARD REDIRECT] Loading:', loading);
  console.log('[DASHBOARD REDIRECT] Role:', user?.role);

  if (loading) {
    console.log('[DASHBOARD REDIRECT] Still loading, showing nothing');
    return null;
  }

  if (!user) {
    console.log('[DASHBOARD REDIRECT] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'agent' || user.role === 'admin') {
    console.log('[DASHBOARD REDIRECT] Agent/Admin detected, redirecting to /agent/dashboard');
    return <Navigate to="/agent/dashboard" replace />;
  }

  console.log('[DASHBOARD REDIRECT] Borrower detected, showing Dashboard');
  return <Dashboard />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <DashboardRedirect />;
  return <Home />;
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <DashboardRedirect />;
  return <Login />;
}

export default App;
