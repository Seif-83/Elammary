import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, Crown, Star, User } from 'lucide-react';

const TIERS = ['all', 'vip', 'loyal', 'regular'];

function CustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(customer || { name: '', phone: '', address: '', notes: '', tier: 'regular' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer) {
        await updateCustomer(customer.id, form);
        toast.success('Customer updated');
      } else {
        await addCustomer(form);
        toast.success('Customer added');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message || 'Error saving customer');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{customer ? 'Edit Customer' : 'New Customer'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="form-row">
                <label className="form-label">Full Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Ahmed Hassan" />
              </div>
              <div className="form-row">
                <label className="form-label">Phone</label>
                <input value={form.phone || ''} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+20 100 000 0000" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Address</label>
              <input value={form.address || ''} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Street, City" />
            </div>
            <div className="form-row">
              <label className="form-label">Notes</label>
              <textarea rows={3} value={form.notes || ''} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Customer preferences, special notes..." />
            </div>
            <div className="form-row">
              <label className="form-label">Tier</label>
              <select value={form.tier} onChange={e => setForm(p => ({...p, tier: e.target.value}))}>
                <option value="regular">Regular</option>
                <option value="loyal">Loyal</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ customer, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCustomer(customer.id);
      toast.success('Customer deleted');
      onDeleted();
    } catch { toast.error('Failed to delete'); } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header"><h2 className="modal-title">Delete Customer</h2><button className="btn-icon" onClick={onClose}>✕</button></div>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{customer.name}</strong>? This will also delete all their orders.</p>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

function TierIcon({ tier }) {
  if (tier === 'vip') return <Crown size={13} />;
  if (tier === 'loyal') return <Star size={13} />;
  return <User size={13} />;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers(search, tierFilter === 'all' ? '' : tierFilter);
      setCustomers(data || []);
    } catch { toast.error('Failed to load customers'); } finally { setLoading(false); }
  }, [search, tierFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openEdit = (c) => { setSelected(c); setModal('edit'); };
  const openDelete = (c) => { setSelected(c); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const handleSaved = () => { closeModal(); fetchCustomers(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} customer{customers.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} />Add Customer</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            {TIERS.map(t => (
              <button key={t} className={`filter-chip ${tierFilter === t ? 'active' : ''}`} onClick={() => setTierFilter(t)}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"/></div> : customers.length === 0 ? (
          <div className="empty-state"><User size={40} /><p>No customers found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Address</th><th>Tier</th><th>Total Purchases</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.name}</td>
                    <td>{c.phone || '—'}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td><span className={`badge badge-${c.tier}`}><TierIcon tier={c.tier} />{c.tier}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(c.total_purchases).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <Link to={`/customers/${c.id}`}><button className="btn-icon" title="View"><Eye size={15}/></button></Link>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(c)}><Edit2 size={15}/></button>
                        <button className="btn-icon danger" title="Delete" onClick={() => openDelete(c)}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'add' && <CustomerModal onClose={closeModal} onSaved={handleSaved} />}
      {modal === 'edit' && <CustomerModal customer={selected} onClose={closeModal} onSaved={handleSaved} />}
      {modal === 'delete' && <DeleteModal customer={selected} onClose={closeModal} onDeleted={handleSaved} />}
    </div>
  );
}
