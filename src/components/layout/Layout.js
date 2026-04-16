import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useThemeLang } from '../../context/ThemeLangContext';
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  LogOut, Menu, X, Sofa, ChevronRight, Sun, Moon, Globe
} from 'lucide-react';
import './Layout.css';

function Greeting({ t }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let text = t('greetingEvening');
  if (hour < 12) text = t('greetingMorning');
  else if (hour < 18) text = t('greetingAfternoon');

  return (
    <div className="greeting">
      <span className="greeting-text">{text},</span>
      <span className="greeting-name"> {t('admin')}</span>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <Icon size={20} className="nav-icon" />
      <span className="nav-label">{label}</span>
      <ChevronRight size={14} className="nav-chevron" />
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, lang, toggleLang, t } = useThemeLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar - Remains static to keep navigation feeling fast */}
      <motion.aside 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon"><Sofa size={22} /></div>
          <span className="brand-name">Elammary</span>
        </div>
        
        <nav className="nav-menu">
          <NavItem to="/" icon={LayoutDashboard} label={t('dashboard')} onClick={() => isMobile && setIsSidebarOpen(false)} />
          <NavItem to="/customers" icon={Users} label={t('clients')} onClick={() => isMobile && setIsSidebarOpen(false)} />
          <NavItem to="/orders" icon={ShoppingBag} label={t('orders')} onClick={() => isMobile && setIsSidebarOpen(false)} />
          <NavItem to="/products" icon={Package} label={t('catalog')} onClick={() => isMobile && setIsSidebarOpen(false)} />
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} /> <span>{t('signOut')}</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`main-wrapper ${isSidebarOpen ? '' : 'full-width'}`}>
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="topbar-left" style={{ marginInlineStart: '1rem' }}>
              <Greeting t={t} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Theme & Language Toggles */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderInlineEnd: '1px solid var(--border)', paddingInlineEnd: '1.5rem', marginInlineEnd: '0.5rem' }}>
              <button 
                onClick={toggleTheme} 
                className="btn-icon" 
                title="Toggle Light/Dark Mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={toggleLang} 
                className="btn-icon" 
                style={{ position: 'relative' }}
                title="Translate En/Ar"
              >
                <Globe size={20} />
                <span style={{ position: 'absolute', top: -4, insetInlineEnd: -4, fontSize: '0.5rem', background: 'var(--gold)', color: '#000', padding: '1px 4px', borderRadius: 4, fontWeight: 'bold' }}>
                  {lang === 'en' ? 'ع' : 'EN'}
                </span>
              </button>
            </div>

            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.displayName || 'Admin'}</span>
                <span className="user-role">{t('admin')}</span>
              </div>
              <div className="user-avatar">{user?.email?.[0].toUpperCase() || 'A'}</div>
            </div>
          </div>
        </header>

        {/* Content with Exit/Enter animations using location key */}
        <div className="content-overflow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ width: '100%', height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
