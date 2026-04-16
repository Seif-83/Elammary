import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sofa, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Access Granted');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-effects">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="login-card-wrap"
      >
        <div className="login-brand-header">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="login-logo"
          >
            <Sofa size={32} />
          </motion.div>
          <h1 className="login-title">Elammary</h1>
          <p className="login-subtitle">Executive CRM & Design Suite</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Master Email</label>
            <div className="input-field">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elammary.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Security Key</label>
            <div className="input-field">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(201, 169, 110, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit" 
            className="btn-login"
          >
            {loading ? (
              <span className="flex items-center gap-2"><div className="spinner sm" /> Authenticating...</span>
            ) : (
              <>Initiate Session <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        <div className="login-footer">
          <Sparkles size={14} color="var(--gold)" />
          <span>Secured by Elammary Cloud Intelligence</span>
        </div>
      </motion.div>

      <style>{`
        .login-container {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #050504; position: relative; overflow: hidden; padding: 1.5rem;
        }
        .login-bg-effects {
          position: absolute; inset: 0; pointer-events: none;
        }
        .glow {
          position: absolute; width: 40vw; height: 40vw; border-radius: 50%;
          filter: blur(120px); opacity: 0.15;
        }
        .glow-1 { top: -10vw; left: -10vw; background: var(--gold); }
        .glow-2 { bottom: -10vw; right: -10vw; background: var(--blue); }

        .login-card-wrap {
          width: 100%; max-width: 440px; background: rgba(20, 20, 18, 0.6);
          backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px; padding: 3rem 2.5rem; box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          z-index: 10;
        }

        .login-brand-header { text-align: center; margin-bottom: 2.5rem; }
        .login-logo {
          width: 64px; height: 64px; background: var(--gold-gradient);
          color: #000; border-radius: 18px; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 30px var(--gold-glow);
        }
        .login-title { font-size: 2.8rem; margin-bottom: 0.25rem; background: linear-gradient(to bottom, #fff, #999); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .login-subtitle { font-size: 0.9rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.15em; }

        .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
        .input-field { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); transition: color 0.3s ease; }
        .input-field input { padding-left: 3rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); width: 100%; }
        .input-field input:focus + .input-icon { color: var(--gold); }

        .btn-login {
          margin-top: 1rem; padding: 1rem; background: var(--gold-gradient);
          color: #000; font-weight: 700; border-radius: 14px; font-size: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
        }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-footer { margin-top: 2.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-dim); }
        .spinner.sm { width: 18px; height: 18px; border-width: 2px; }
      `}</style>
    </div>
  );
}
