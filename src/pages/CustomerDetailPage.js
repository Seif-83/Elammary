import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomerDetail, getProducts, addOrder, updateOrder, deleteOrder } from '../services/db';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, MapPin, FileText, Crown, Star, User, Plus, Edit2, Trash2 } from 'lucide-react';

function OrderModal({ customerId, customerName, order, onClose, onSaved }) {
  const [form, setForm] = useState(order || { furniture_type: '', price: '', status: 'pending', order_date: new Date().toISOString().split('T')[0], notes: '' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProducts().then(setProducts); }, []);

  const handleProductSelect = (e) => {
    const pid = e.target.value;
    if (!pid) return;
    const p = products.find(x => x.id === pid);
    if (p) setForm(prev => ({ ...prev, furniture_type: p.name, price: p.price }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (order) { 
        await updateOrder(order.id, form); 
        toast.success('Order updated'); 
      } else { 
        await addOrder({ ...form, customer_id: customerId, customer_name: customerName }); 
        toast.success('Order created'); 
      }
      onSaved();
    } catch (err) { 
      toast.error(err.message || 'Error saving order'); 
    } finally { setLoading(false); }
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
              <label className="form-label">Quick Select Product</label>
              <select onChange={handleProductSelect} defaultValue="">
                <option value="">— Pick from catalog —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
              </select>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-row">
                <label className="form-label">Furniture Type *</label>
                <input required value={form.furniture_type} onChange={e => setForm(p => ({...p, furniture_type: e.target.value}))} placeholder="e.g. Sofa, Table..." />
              </div>
              <div className="form-row">
                <label className="form-label">Price *</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="0.00" />
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
                <input type="date" value={form.order_date || ''} onChange={e => setForm(p => ({...p, order_date: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Notes</label>
              <textarea rows={2} value={form.notes || ''} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Special requests..." />
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

function TierIcon({ tier }) {
  if (tier === 'vip') return <Crown size={14} />;
  if (tier === 'loyal') return <Star size={14} />;
  return <User size={14} />;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCustomer = async () => {
    try {
      const data = await getCustomerDetail(id);
      setCustomer(data);
    } catch { toast.error('Customer not found'); navigate('/customers'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomer(); }, [id]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try { 
      await deleteOrder(orderId); 
      toast.success('Order deleted'); 
      fetchCustomer(); 
    } catch { toast.error('Failed to delete order'); }
  };

  const closeModal = () => { setModal(null); setSelectedOrder(null); };
  const handleOrderSaved = () => { closeModal(); fetchCustomer(); };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!customer) return null;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text3)', fontSize: '0.85rem' }}>
          <ArrowLeft size={15} /> Back to Customers
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Customer Info Card */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--gold-dim)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '0.9rem', border: '1px solid rgba(201,169,110,0.25)' }}>
              {customer.name[0]}
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{customer.name}</h2>
            <span className={`badge badge-${customer.tier}`}><TierIcon tier={customer.tier} />{customer.tier}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {customer.phone && <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}><Phone size={15} style={{ color: 'var(--text3)', marginTop: 2, flexShrink: 0 }} /><div><div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Phone</div><div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{customer.phone}</div></div></div>}
            {customer.address && <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}><MapPin size={15} style={{ color: 'var(--text3)', marginTop: 2, flexShrink: 0 }} /><div><div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Address</div><div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{customer.address}</div></div></div>}
            {customer.notes && <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}><FileText size={15} style={{ color: 'var(--text3)', marginTop: 2, flexShrink: 0 }} /><div><div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Notes</div><div style={{ fontSize: '0.88rem', color: 'var(--text2)' }}>{customer.notes}</div></div></div>}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.1rem', paddingTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Purchases</span>
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--gold)', fontWeight: 600 }}>${Number(customer.total_purchases).toLocaleString()}</div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Link to={`/customers`} style={{ flex: 1 }}><button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Edit Metadata</button></Link>
          </div>
        </div>

        {/* Orders Panel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem' }}>Orders <span style={{ fontFamily: 'DM Sans', fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 400 }}>({customer.orders?.length || 0})</span></h2>
            <button className="btn-primary" onClick={() => setModal('order')}><Plus size={15} />New Order</button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {!customer.orders?.length ? (
              <div className="empty-state"><p>No orders yet. Create the first order for this customer.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Item</th><th>Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {customer.orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{o.furniture_type}</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(o.price).toLocaleString()}</td>
                        <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                        <td>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" onClick={() => { setSelectedOrder(o); setModal('order'); }}><Edit2 size={14}/></button>
                            <button className="btn-icon danger" onClick={() => handleDeleteOrder(o.id)}><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === 'order' && <OrderModal customerId={id} customerName={customer.name} order={selectedOrder} onClose={closeModal} onSaved={handleOrderSaved} />}

      <style>{`@media(max-width:768px){.detail-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}
