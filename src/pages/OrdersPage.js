import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, addOrder, updateOrder, deleteOrder, getCustomers, getProducts } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, ShoppingBag } from 'lucide-react';

const STATUSES = ['all', 'pending', 'in-progress', 'delivered'];

function OrderModal({ order, onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(order ? {
    customer_id: order.customer_id, 
    customer_name: order.customer_name || '',
    furniture_type: order.furniture_type,
    price: order.price, status: order.status,
    order_date: order.order_date || '', notes: order.notes || ''
  } : { customer_id: '', customer_name: '', furniture_type: '', price: '', status: 'pending', order_date: new Date().toISOString().split('T')[0], notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers);
    getProducts().then(setProducts);
  }, []);

  const handleCustomerChange = (e) => {
    const cid = e.target.value;
    const c = customers.find(x => x.id === cid);
    setForm(prev => ({ ...prev, customer_id: cid, customer_name: c ? c.name : '' }));
  };

  const handleProductSelect = (e) => {
    const pid = e.target.value;
    if (!pid) return;
    const p = products.find(x => x.id === pid);
    if (p) setForm(prev => ({ ...prev, furniture_type: p.name, price: p.price }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (order) { await updateOrder(order.id, form); toast.success('Order updated'); }
      else { await addOrder(form); toast.success('Order created'); }
      onSaved();
    } catch (err) { toast.error(err.message || 'Error saving'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{order ? 'Edit Order' : 'New Order'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Customer *</label>
              <select required value={form.customer_id} onChange={handleCustomerChange}>
                <option value="">— Select Customer —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Quick Select Product</label>
              <select onChange={handleProductSelect} defaultValue="">
                <option value="">— Pick from catalog —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
              </select>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-row">
                <label className="form-label">Furniture Type *</label>
                <input required value={form.furniture_type} onChange={e => setForm(p => ({...p, furniture_type: e.target.value}))} placeholder="e.g. Sofa" />
              </div>
              <div className="form-row">
                <label className="form-label">Price *</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-row">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Order Date</label>
                <input type="date" value={form.order_date} onChange={e => setForm(p => ({...p, order_date: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Order'}</button>
          </div>
        </form>
      </div>
    </div>
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
      let list = await getOrders();
      if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(o => 
          o.furniture_type?.toLowerCase().includes(s) || 
          o.customer_name?.toLowerCase().includes(s)
        );
      }
      setOrders(list);
    } catch { toast.error('Failed to load orders'); } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try { await deleteOrder(id); toast.success('Order deleted'); fetchOrders(); }
    catch { toast.error('Failed to delete'); }
  };

  const closeModal = () => { setModal(null); setSelected(null); };
  const handleSaved = () => { closeModal(); fetchOrders(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} />New Order</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder="Search by item or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            {STATUSES.map(s => (
              <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"/></div> : orders.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={40} /><p>No orders found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Furniture</th><th>Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>#{o.id.slice(0, 5)}...</td>
                    <td><Link to={`/customers/${o.customer_id}`} style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>{o.customer_name || '—'}</Link></td>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{o.furniture_type}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(o.price).toLocaleString()}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn-icon" onClick={() => { setSelected(o); setModal('edit'); }}><Edit2 size={14}/></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(o.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'add' && <OrderModal onClose={closeModal} onSaved={handleSaved} />}
      {modal === 'edit' && <OrderModal order={selected} onClose={closeModal} onSaved={handleSaved} />}
    </div>
  );
}
