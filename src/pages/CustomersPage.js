import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkeletonTable } from '../components/ui/Skeleton';
import { useThemeLang } from '../context/ThemeLangContext';

function CustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(customer || { name: '', phone: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); 
    setLoading(true);
    
    // Optimistic Save
    if (customer) { updateCustomer(customer.id, form).catch(console.error); toast.success('Profile updated'); }
    else { addCustomer(form).catch(console.error); toast.success('Customer added'); }
    
    setLoading(false);
    onSaved();
  };

  const { t } = useThemeLang();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">{customer ? t('editProfile') : t('newCustomer')}</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">{t('fullName')}</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder={t('egName')} />
            </div>
            <div className="form-row">
              <label className="form-label">{t('phoneNumber')}</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder={t('egPhone')} />
            </div>
            <div className="form-row">
              <label className="form-label">{t('physAddress')}</label>
              <textarea rows={2} value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder={t('shippingDet')} />
            </div>
            <div className="form-row">
              <label className="form-label">{t('privateNotes')}</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder={t('specialPref')} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('saveCustomer')}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const { t } = useThemeLang();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getCustomers();
      if (tierFilter !== 'all') data = data.filter(c => c.tier === tierFilter);
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(c => c.name?.toLowerCase().includes(s) || c.phone?.includes(s));
      }
      setCustomers(data || []);
    } catch { toast.error('Failed to load customers'); } finally { setLoading(false); }
  }, [search, tierFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = (id) => {
    if (!window.confirm('This will delete the customer and all their orders. Continue?')) return;
    
    // Optimistic UI Update
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast.success('Customer removed');
    
    // Background Firebase Delete
    deleteCustomer(id).catch(err => {
      console.error(err);
      toast.error('Sync error on delete');
      fetchCustomers(); // revert on failure
    });
  };

  const closeModal = () => { setModal(null); setSelected(null); };
  const handleSaved = () => { closeModal(); fetchCustomers(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('clientDir')}</h1>
          <p className="page-subtitle">{t('clientDirSub')}</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary" onClick={() => setModal('add')}
        >
          <Plus size={16} />{t('addClient')}
        </motion.button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder={t('searchClients')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            <button className={`filter-chip ${tierFilter === 'all' ? 'active' : ''}`} onClick={() => setTierFilter('all')}>
              {t('all')}
            </button>
            <button className={`filter-chip ${tierFilter === 'vip' ? 'active' : ''}`} onClick={() => setTierFilter('vip')}>
              {t('vip')}
            </button>
            <button className={`filter-chip ${tierFilter === 'loyal' ? 'active' : ''}`} onClick={() => setTierFilter('loyal')}>
              {t('loyal')}
            </button>
            <button className={`filter-chip ${tierFilter === 'regular' ? 'active' : ''}`} onClick={() => setTierFilter('regular')}>
              {t('regular')}
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={8} />
        ) : customers.length === 0 ? (
          <div className="empty-state"><User size={40} /><p>{t('noClients')}</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('clientName')}</th>
                  <th>{t('tierStatus')}</th>
                  <th>{t('phoneContact')}</th>
                  <th>{t('lifetimeValue')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {customers.map((c, idx) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', border: '1px solid var(--border)' }}>
                            {c.name[0]}
                          </div>
                          {c.name}
                        </Link>
                      </td>
                      <td><span className={`badge badge-${c.tier}`}>{c.tier}</span></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {c.phone || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--gold)', fontWeight: 700 }}>${Number(c.total_purchases || 0).toLocaleString()}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" onClick={() => { setSelected(c); setModal('edit'); }}><Edit2 size={14}/></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(c.id)}><Trash2 size={14}/></button>
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
        {modal === 'add' && <CustomerModal onClose={closeModal} onSaved={handleSaved} />}
        {modal === 'edit' && <CustomerModal customer={selected} onClose={closeModal} onSaved={handleSaved} />}
      </AnimatePresence>
    </motion.div>
  );
}
