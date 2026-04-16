import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Package, Tag } from 'lucide-react';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useThemeLang } from '../context/ThemeLangContext';

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || { name: '', category: '', price: '', description: '', stock: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); 
    setLoading(true);
    if (product) { updateProduct(product.id, form).catch(console.error); toast.success('Catalog updated'); }
    else { addProduct(form).catch(console.error); toast.success('Item added to catalog'); }
    setLoading(false);
    onSaved();
  };

  const CATEGORIES = ['Sofas', 'Dining', 'Bedroom', 'Living Room', 'Storage', 'Seating', 'Outdoor', 'Office'];

  const { t } = useThemeLang();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        className="modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">{product ? t('refineProduct') : t('registryEntry')}</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">{t('prodMoniker')}</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder={t('egMoniker')} />
            </div>
            <div className="form-grid-2">
              <div className="form-row">
                <label className="form-label">{t('classification')}</label>
                <select required value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  <option value="">{t('select')}</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">{t('unitPrice')}</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="0.00" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">{t('designDesc')}</label>
              <textarea rows={2} value={form.description || ''} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder={t('dimMat')} />
            </div>
            <div className="form-row">
              <label className="form-label">{t('inventoryCount')}</label>
              <input type="number" min="0" value={form.stock || 0} onChange={e => setForm(p => ({...p, stock: e.target.value}))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('updating') : t('saveDesign')}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const { t } = useThemeLang();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getProducts();
      
      const uniqueCats = [...new Set(data.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCats);

      if (catFilter !== 'all') data = data.filter(p => p.category === catFilter);
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(p => p.name?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
      }
      
      setProducts(data || []);
    } catch { toast.error('Failed to load products'); } finally { setLoading(false); }
  }, [search, catFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = (id) => {
    if (!window.confirm('Retire this design from catalog?')) return;
    
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Entry removed');
    
    deleteProduct(id).catch(err => {
      console.error(err);
      toast.error('Sync error on delete');
      fetchProducts();
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('curatedCol')}</h1>
          <p className="page-subtitle">{t('curatedSub')}</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary" onClick={() => setModal('add')}
        >
          <Plus size={16} />{t('regDesign')}
        </motion.button>
      </div>

      <div className="card" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar">
              <Search size={15} className="search-icon" />
              <input placeholder={t('searchCat')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filters">
              <button className={`filter-chip ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter('all')}>{t('all')}</button>
              {categories.map(c => (
                <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} height="200px" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>{t('noCatalogEntry')}</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <AnimatePresence mode="popLayout">
              {products.map((p, idx) => (
                <motion.div 
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--gold-glow)', color: 'var(--gold)' }}>
                      <Tag size={16} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn-icon" onClick={() => { setSelected(p); setModal('edit'); }}><Edit2 size={13}/></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={13}/></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{p.category}</div>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: 6 }}>{p.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.description || t('noDesc')}
                    </p>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.2rem' }}>${Number(p.price).toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: p.stock > 0 ? 'var(--green)' : 'var(--red)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.stock > 0 ? 'var(--green)' : 'var(--red)' }} />
                      {p.stock} {t('unitsReserve')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal === 'add' && <ProductModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchProducts(); }} />}
        {modal === 'edit' && <ProductModal product={selected} onClose={() => { setModal(null); setSelected(null); }} onSaved={() => { setModal(null); setSelected(null); fetchProducts(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}
