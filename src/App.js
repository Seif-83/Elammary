import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeLangProvider } from './context/ThemeLangContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import { Sofa } from 'lucide-react';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSplash />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSplash />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function LoadingSplash() {
  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
      <div className="login-logo pulse"><Sofa size={32} color="var(--gold)" /></div>
      <div className="spinner sm" />
      <style>{`
        @keyframes pulse-logo { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        .pulse { animation: pulse-logo 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeLangProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="products" element={<ProductsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeLangProvider>
    </AuthProvider>
  );
}
