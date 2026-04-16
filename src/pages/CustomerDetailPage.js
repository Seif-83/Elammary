import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomerDetail, getProducts, addOrder, updateOrder, deleteOrder } from '../services/db';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Phone, MapPin, FileText, Crown, 
  Star, User, Plus, Edit2, Trash2, ShoppingBag 
} from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/ui/Skeleton';

function OrderModal({ customerId, customerName, order, onClose, onSaved }) {
  const [form, setForm] = useState(order || { furniture_type: '', price: '', status: 'pending', order_date: new Date().toISOString().split('T')[0], notes: '' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProducts().then(setProducts); }, []);

  const handleProductSelect = (e) => {
    const pid = e.target.value;
    const p = products.find(x => x.id === pid);
    if (p) setForm(prev => ({ ...prev, furniture_type: p.name, price: p.price }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (order) { await updateOrder(order.id, form); toast.success('Order recorded'); }
      else { await addOrder({ ...form, customer_id: customerId, customer_name: customerName }); toast.success('Order initiated'); }
      onSaved();
    } catch (err) { toast.error(err.message || 'Error saving'); } finally { setLoading(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
        className="modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">{order ? 'Edit Record' : 'Log New Sale'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Catalog Select</label>
              <select onChange={handleProductSelect} defaultValue="">
                <option value="">— Pick a design —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Item *</label>
                <input required value={form.furniture_type} onChange={e => setForm(p => ({...p, furniture_type: e.target.value}))} />
              </div>
              <div className="form-row">
                <label className="form-label">Price *</label>
                <input required type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Order'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TierBadge({ tier }) {
  const tiers = {
    vip: { icon: Crown, label: 'VIP Selection', color: 'var(--gold)' },
    loyal: { icon: Star, label: 'Loyal Client', color: 'var(--blue)' },
    regular: { icon: User, label: 'Standard', color: 'var(--text-dim)' }
  };
  const { icon: Icon, label, color } = tiers[tier] || tiers.regular;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <Icon size={14} /> {label}
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCustomer = React.useCallback(async () => {
    try {
      const data = await getCustomerDetail(id);
      setCustomer(data);
    } catch { toast.error('Client not found'); navigate('/customers'); } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteOrder(orderId); toast.success('Entry removed'); fetchCustomer(); }
    catch { toast.error('Failed'); }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '2rem' }}><Skeleton width="150px" height="20px" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }} className="detail-grid">
          <div className="card"><Skeleton height="300px" /></div>
          <div className="card"><Skeleton height="400px" /></div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', hover: { color: 'var(--gold)' } }}>
          <ArrowLeft size={16} /> Return to Directory
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }} className="detail-grid">
        <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="card" style={{ height: 'fit-content', position: 'sticky', top: '90px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--gold-gradient)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, margin: '0 auto 1.2rem', boxShadow: '0 10px 30px var(--gold-glow)' }}>
              {customer.name[0]}
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{customer.name}</h2>
            <TierBadge tier={customer.tier} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}><Phone size={16}/></div>
              <div><div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</div><div style={{ fontSize: '0.95rem' }}>{customer.phone || 'N/A'}</div></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}><MapPin size={16}/></div>
              <div><div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Address</div><div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{customer.address || 'No address stored'}</div></div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 16, border: '1px solid var(--border)', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Lifetime Portfolio Value</div>
            <div style={{ fontSize: '2.4rem', color: 'var(--gold)', fontWeight: 600, fontFamily: 'Cormorant Garamond' }}>${Number(customer.total_purchases || 0).toLocaleString()}</div>
          </div>
        </motion.div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>Purchasing History <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>({customer.orders?.length || 0})</span></h2>
            <button className="btn-primary" onClick={() => setModal('order')}><Plus size={16} />Log Transaction</button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {!customer.orders?.length ? (
              <div className="empty-state" style={{ padding: '6rem 2rem' }}><ShoppingBag size={48} color="var(--border)" /><p>No registered transactions for this client yet.</p></div>
            ) : (
              <div className="table-wrap">
                <table style={{ borderSpacing: '0 8px' }}>
                  <thead><tr><th>Item</th><th>Acquisition Value</th><th>Current Status</th><th>Registered Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {customer.orders.map((o, idx) => (
                        <motion.tr key={o.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                          <td style={{ fontWeight: 600, color: 'var(--text)' }}>{o.furniture_type}</td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>${Number(o.price).toLocaleString()}</td>
                          <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn-icon" onClick={() => { setSelectedOrder(o); setModal('order'); }}><Edit2 size={13}/></button>
                              <button className="btn-icon danger" onClick={() => handleDeleteOrder(o.id)}><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal === 'order' && <OrderModal customerId={id} customerName={customer.name} order={selectedOrder} onClose={() => { setModal(null); setSelectedOrder(null); }} onSaved={() => { setModal(null); fetchCustomer(); }} />}
      </AnimatePresence>

      <style>{`
        @media(max-width:900px){ .detail-grid { grid-template-columns: 1fr !important; } .card { position: static !important; } }
      `}</style>
    </motion.div>
  );
}
