import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, addOrder, updateOrder, deleteOrder, getCustomers, getProducts } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, ShoppingBag, Filter, Calendar } from 'lucide-react';
import { SkeletonTable } from '../components/ui/Skeleton';

function OrderModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState(order || { customer_id: '', furniture_type: '', price: '', status: 'pending', order_date: new Date().toISOString().split('T')[0], notes: '' });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()]).then(([c, p]) => {
      setCustomers(c || []);
      setProducts(p || []);
    });
  }, []);

  const handleProductSelect = (e) => {
    const pid = e.target.value;
    const prod = products.find(x => x.id === pid);
    if (prod) setForm(prev => ({ ...prev, furniture_type: prod.name, price: prod.price }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (order) { await updateOrder(order.id, form); toast.success('Order updated'); }
      else { 
        const cust = customers.find(c => c.id === form.customer_id);
        await addOrder({ ...form, customer_id: form.customer_id, customer_name: cust?.name }); 
        toast.success('Order created'); 
      }
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
        className="modal" style={{ maxWidth: 640 }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{order ? 'Modify Transaction' : 'New Transaction'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {!order && (
              <div className="form-row">
                <label className="form-label">Client Selection *</label>
                <select required value={form.customer_id} onChange={e => setForm(p => ({...p, customer_id: e.target.value}))}>
                  <option value="">— Choose a client —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>)}
                </select>
              </div>
            )}
            <div className="form-row">
              <label className="form-label">Product Lookup</label>
              <select onChange={handleProductSelect} defaultValue="">
                <option value="">— Pick from catalog (optional) —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Description *</label>
                <input required value={form.furniture_type} onChange={e => setForm(p => ({...p, furniture_type: e.target.value}))} placeholder="e.g. Vintage Oak Desk" />
              </div>
              <div className="form-row">
                <label className="form-label">Total Amount *</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="0.00" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">Order Status</label>
                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Transaction Date</label>
                <input type="date" value={form.order_date} onChange={e => setForm(p => ({...p, order_date: e.target.value}))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Discard</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Syncing...' : 'Confirm Order'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getOrders();
      if (statusFilter !== 'all') data = data.filter(o => o.status === statusFilter);
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(o => o.customer_name?.toLowerCase().includes(s) || o.furniture_type?.toLowerCase().includes(s));
      }
      setOrders(data || []);
    } catch { toast.error('Failed to load orders'); } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm('Void this transaction? This will also revert total purchase calculations.')) return;
    try { await deleteOrder(id); toast.success('Order voided'); fetchOrders(); }
    catch { toast.error('Failed to void'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Ledger</h1>
          <p className="page-subtitle">Track and manage every piece of furniture sold.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary" onClick={() => setModal('add')}
        >
          <Plus size={16} />Create Transaction
        </motion.button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder="Filter by client or item..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            {['all', 'pending', 'in-progress', 'delivered'].map(s => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={10} />
        ) : orders.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={40} /><p>No transactions found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID / Client</th>
                  <th>Item Description</th>
                  <th>Value</th>
                  <th>Workflow Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {orders.map((o, idx) => (
                    <motion.tr 
                      key={o.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>#{o.id.slice(-6).toUpperCase()}</span>
                          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{o.customer_name}</span>
                        </div>
                      </td>
                      <td>{o.furniture_type}</td>
                      <td>
                        <div style={{ color: 'var(--gold)', fontWeight: 700 }}>${Number(o.price).toLocaleString()}</div>
                      </td>
                      <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Calendar size={12} /> {o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" onClick={() => { setSelectedOrder(o); setModal('edit'); }}><Edit2 size={14}/></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(o.id)}><Trash2 size={14}/></button>
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

      <AnimatePresence>
        {modal === 'add' && <OrderModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchOrders(); }} />}
        {modal === 'edit' && <OrderModal order={selectedOrder} onClose={() => { setModal(null); setSelectedOrder(null); }} onSaved={() => { setModal(null); setSelectedOrder(null); fetchOrders(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}
