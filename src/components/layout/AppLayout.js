import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ title, actions, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h2 className="topbar-title">{title}</h2>
          <div className="topbar-actions">{actions}</div>
        </div>
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}
