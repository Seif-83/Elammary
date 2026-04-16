import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../services/db';
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, 
  ArrowUpRight, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { SkeletonStat, SkeletonCard } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { useThemeLang } from '../context/ThemeLangContext';

function StatCard({ title, value, icon: Icon, trend, color, glow, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: glow, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: '0.75rem', fontWeight: 600, background: 'var(--green-glow)', padding: '2px 8px', borderRadius: 99 }}>
            <ArrowUpRight size={12} /> {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '2.2rem', fontFamily: 'Cormorant Garamond', fontWeight: 600, color: 'var(--text)' }}>
          {typeof value === 'number' && title.includes('Revenue') ? `$${value.toLocaleString()}` : value?.toLocaleString() || '0'}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useThemeLang();

  useEffect(() => {
    getDashboardStats()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header" style={{ marginBottom: '2.5rem' }}>
          <div>
            <h1 className="page-title">{t('execSummary')}</h1>
            <p className="page-subtitle">Waking up the systems...</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <SkeletonCard height="350px" />
          <SkeletonCard height="350px" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, revenueByMonth, tierDistribution, recentOrders } = data;
  const COLORS = ['#c9a96e', '#6b9fd4', '#4caf7d', '#e8a838'];

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">{t('execSummary')}</h1>
          <p className="page-subtitle">{t('dashSubtitle')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard title={t('totCustomers')} value={stats.totalCustomers} icon={Users} trend="+12%" color="var(--blue)" glow="var(--blue-glow)" delay={0.1} />
        <StatCard title={t('totOrders')} value={stats.totalOrders} icon={ShoppingBag} trend="+5%" color="var(--amber)" glow="var(--amber-glow)" delay={0.2} />
        <StatCard title={t('totRevenue')} value={stats.totalRevenue} icon={DollarSign} trend="+18%" color="var(--gold)" glow="var(--gold-glow)" delay={0.3} />
        <StatCard title={t('activeGrowth')} value="24%" icon={TrendingUp} color="var(--green)" glow="var(--green-glow)" delay={0.4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="grid-responsive">
        <motion.div variants={listVariants} className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--gold)" /> {t('revInsights')}
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip 
                  contentStyle={{ background: '#12110f', border: '1px solid var(--border)', borderRadius: '10px' }}
                  itemStyle={{ color: 'var(--gold)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--gold)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={listVariants} className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{t('custBase')}</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {tierDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#12110f', border: '1px solid var(--border)', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {tierDistribution?.map((c, i) => (
              <div key={c.tier} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                <span style={{ color: 'var(--text-dim)', textTransform: 'capitalize' }}>{c.tier}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={listVariants} className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--gold)" /> {t('recentTrans')}
          </h3>
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>{t('viewAll')}</button>
        </div>
        <div className="table-wrap">
          <table style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th>{t('customer')}</th>
                <th>{t('item')}</th>
                <th>{t('amount')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order, idx) => (
                <motion.tr 
                  key={order.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.5 + idx * 0.1 }}
                >
                  <td style={{ color: 'var(--text)' }}>{order.customer_name}</td>
                  <td>{order.furniture_type}</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${order.price?.toLocaleString() || '0'}</td>
                  <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
