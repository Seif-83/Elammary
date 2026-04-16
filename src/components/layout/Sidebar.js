import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  LogOut, ChevronRight, Sofa
} from 'lucide-react';

const navItems = [
  { section: 'Overview', items: [{ icon: LayoutDashboard, label: 'Dashboard', path: '/' }] },
  {
    section: 'Management', items: [
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: ShoppingBag, label: 'Orders', path: '/orders' },
      { icon: Package, label: 'Products', path: '/products' },
    ]
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1><Sofa size={16} style={{ display: 'inline', marginRight: 8 }} />Elammary</h1>
        <span>CRM Suite</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const active = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <span>{user?.username}</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ marginTop: 10, width: '100%', justifyContent: 'flex-start' }}
        >
          <LogOut size={13} /><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
