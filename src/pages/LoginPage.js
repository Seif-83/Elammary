import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Sofa, Lock, User, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@dev.com', password: 'admin123' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-pattern"/>
      </div>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-icon"><Sofa size={24} /></div>
          <h1 className="login-title">Elammary CRM</h1>
          <p className="login-subtitle">Furniture Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <User size={15} className="input-icon" />
              <input
                type="email" placeholder="Enter email" required
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                style={{paddingLeft:'2.5rem'}}
              />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input
                type={showPw ? 'text' : 'password'} placeholder="Enter password" required
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                style={{paddingLeft:'2.5rem', paddingRight:'2.75rem'}}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">Note: Please ensure your user exists in Firebase Auth.</p>
      </div>
    </div>
  );
}
