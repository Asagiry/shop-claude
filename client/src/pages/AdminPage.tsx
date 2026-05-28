import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Product, Order, Category } from '../types';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '1', sizes: 'S,M,L,XL', stock: '10' });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords, cats] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/products/categories'),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCategories(cats);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSaveProduct = async () => {
    setSaveError('');
    if (!form.name || !form.price) {
      setSaveError('Name and price are required');
      return;
    }
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image_url: form.image_url,
        category_id: parseInt(form.category_id),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        stock: parseInt(form.stock) || 0,
      };

      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, data);
        setSaveMsg('Product updated!');
      } else {
        await api.post('/admin/products', data);
        setSaveMsg('Product created!');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm({ name: '', description: '', price: '', image_url: '', category_id: '1', sizes: 'S,M,L,XL', stock: '10' });
      loadData();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e: any) {
      setSaveError(e.error || 'Failed to save product');
    }
  };

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      image_url: p.image_url || '',
      category_id: String(p.category_id),
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
      stock: String(p.stock),
    });
    setShowForm(true);
    setSaveError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setSaveMsg('Product deleted');
      loadData();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e: any) {
      setSaveError(e.error || 'Failed to delete');
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch {}
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-yellow-100 text-yellow-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your products and orders</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${tab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Products ({products.length})
          </button>
          <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${tab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {saveMsg && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 animate-fade-in">{saveMsg}</div>}

      {tab === 'products' && (
        <div>
          <button onClick={() => { setShowForm(true); setEditProduct(null); setSaveError(''); setForm({ name: '', description: '', price: '', image_url: '', category_id: '1', sizes: 'S,M,L,XL', stock: '10' }); }}
            className="btn-primary mb-6">+ Add Product</button>

          {showForm && (
            <div className="card p-6 mb-6 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">{editProduct ? `Edit: ${editProduct.name}` : 'New Product'}</h3>
              {saveError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{saveError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input className="input-field" placeholder="e.g. Vibe Miner Tee" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input className="input-field" placeholder="29.99" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input className="input-field" placeholder="https://... or /assets/..." value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} />
                  <p className="text-xs text-gray-400 mt-1">External URLs will be downloaded and stored locally</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input-field" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
                  <input className="input-field" placeholder="S, M, L, XL" value={form.sizes} onChange={(e) => setForm({...form, sizes: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input className="input-field" placeholder="10" type="number" min="0" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="input-field" rows={3} placeholder="Product description..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveProduct} className="btn-primary">{editProduct ? 'Update Product' : 'Create Product'}</button>
                <button onClick={() => { setShowForm(false); setEditProduct(null); setSaveError(''); }} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Image</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">{p.id}</td>
                      <td className="py-3 px-4">
                        <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" alt=""
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/f3f4f6/9ca3af?text=-'; }} />
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3 px-4">${Number(p.price).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{p.category_name}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleEdit(p)} className="text-primary-600 hover:text-primary-700 mr-3 font-medium text-sm">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600 font-medium text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-lg font-medium">No orders yet</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">#{order.id}</span>
                  <span className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="text-gray-500 text-sm font-medium">{order.username || order.user_email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer appearance-none pr-6 ${statusColor(order.status)}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center', backgroundSize: '1rem' }}>
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <span className="font-bold text-lg text-gray-900">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.product_name} {item.size && <span className="text-gray-400">({item.size})</span>} &times; {item.quantity}</span>
                    <span className="font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-3 flex flex-wrap gap-2">
                <span>{order.full_name}</span>
                <span>&middot;</span>
                <span>{order.phone}</span>
                <span>&middot;</span>
                <span>{order.address}</span>
                <span>&middot;</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
