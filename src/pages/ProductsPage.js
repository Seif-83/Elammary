import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/db';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || { name: '', category: '', price: '', description: '', stock: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (product) { await updateProduct(product.id, form); toast.success('Product updated'); }
      else { await addProduct(form); toast.success('Product added'); }
      onSaved();
    } catch (err) { toast.error(err.message || 'Error saving'); } finally { setLoading(false); }
  };

  const CATEGORIES = ['Sofas', 'Dining', 'Bedroom', 'Living Room', 'Storage', 'Seating', 'Outdoor', 'Office'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'New Product'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Product Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Oslo Sectional Sofa" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-row">
                <label className="form-label">Category *</label>
                <select required value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  <option value="">— Select —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Price *</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="0.00" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea rows={2} value={form.description || ''} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Product details..." />
            </div>
            <div className="form-row">
              <label className="form-label">Stock Quantity</label>
              <input type="number" min="0" value={form.stock || 0} onChange={e => setForm(p => ({...p, stock: e.target.value}))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getProducts();
      
      // Extract unique categories for filter
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await deleteProduct(id); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete'); }
  };

  const closeModal = () => { setModal(null); setSelected(null); };
  const handleSaved = () => { closeModal(); fetchProducts(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} />Add Product</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={15} className="search-icon" />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filters">
            <button className={`filter-chip ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter('all')}>All</button>
            {categories.map(c => (
              <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"/></div> : products.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>No products found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{p.name}</td>
                    <td><span className="badge badge-regular">{p.category}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(p.price).toLocaleString()}</td>
                    <td>
                      <span style={{ color: p.stock > 5 ? 'var(--green)' : p.stock > 0 ? 'var(--amber)' : 'var(--red)' }}>
                        {p.stock} units
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn-icon" onClick={() => { setSelected(p); setModal('edit'); }}><Edit2 size={14}/></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'add' && <ProductModal onClose={closeModal} onSaved={handleSaved} />}
      {modal === 'edit' && <ProductModal product={selected} onClose={closeModal} onSaved={handleSaved} />}
    </div>
  );
}
