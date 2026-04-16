import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/db';
import { Users, ShoppingBag, DollarSign, Clock, TrendingUp, Crown } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const STATUS_COLORS = { pending: '#e8a838', 'in-progress': '#6b9fd4', delivered: '#4caf7d' };
const TIER_COLORS = { vip: '#c9a96e', loyal: '#6b9fd4', regular: '#6b6459' };

function StatCard({ label, value, icon: Icon, color, prefix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-inner">
        <div>
          <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
          <div className="stat-label">{label}</div>
        </div>
        <div className="stat-icon" style={{ background: `${color}20`, color }}><Icon size={22} /></div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem' }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color || 'var(--text)' }}>
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, topCustomers, recentOrders, revenueByMonth, ordersByStatus, tierDistribution, topFurnitureTypes } = data;

  const tierData = tierDistribution.map(t => ({ name: t.tier, value: Number(t.count), color: TIER_COLORS[t.tier] || '#888' }));
  const statusData = ordersByStatus.map(s => ({ name: s.status, value: Number(s.count), color: STATUS_COLORS[s.status] || '#888' }));
  const revenueData = revenueByMonth.map(r => ({ month: r.month?.slice(5), revenue: Number(r.revenue), orders: Number(r.order_count) }));
  const furnitureData = topFurnitureTypes.map(f => ({ name: f.furniture_type, count: Number(f.count), revenue: Number(f.revenue) }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your furniture business</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} color="var(--gold)" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="var(--blue)" />
        <StatCard label="Total Revenue" value={Math.round(stats.totalRevenue)} icon={DollarSign} color="var(--green)" prefix="$" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} color="var(--amber)" />
        <StatCard label="In Progress" value={stats.inProgressOrders} icon={TrendingUp} color="var(--blue)" />
        <StatCard label="VIP Customers" value={stats.vipCustomers} icon={Crown} color="var(--gold)" />
      </div>

      <div className="dash-grid" style={{ marginTop: '1.75rem' }}>
        {/* Revenue Chart */}
        <div className="card dash-wide">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Revenue Over Time</h3>
          {revenueData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#c9a96e" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No revenue data yet</p></div>}
        </div>

        {/* Tier Pie */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Customer Tiers</h3>
          {tierData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text2)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data</p></div>}
        </div>

        {/* Furniture Types */}
        <div className="card dash-wide">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Top Furniture Categories</h3>
          {furnitureData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={furnitureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Orders" fill="#c9a96e" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data</p></div>}
        </div>

        {/* Order Status Pie */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Orders by Status</h3>
          {statusData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text2)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No data</p></div>}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
        {/* Top Customers */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem', fontSize: '1.1rem' }}>Top Customers</h3>
          {topCustomers.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {topCustomers.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? 'var(--gold-dim)' : 'var(--bg3)', color: i === 0 ? 'var(--gold)' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{c.phone}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.88rem', color: 'var(--gold)', fontWeight: 600 }}>${Number(c.total_purchases).toLocaleString()}</div>
                    <span className={`badge badge-${c.tier}`}>{c.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No customers yet</p></div>}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem', fontSize: '1.1rem' }}>Recent Orders</h3>
          {recentOrders.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentOrders.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.furniture_type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{o.customer_name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>${Number(o.price).toLocaleString()}</div>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No orders yet</p></div>}
        </div>
      </div>

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }
        .dash-wide { grid-column: 1; }
        @media(max-width:900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
