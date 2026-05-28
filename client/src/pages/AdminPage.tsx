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
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image_url: form.image_url,
        category_id: parseInt(form.category_id),
        sizes: form.sizes.split(',').map(s => s.trim()),
        stock: parseInt(form.stock),
      };

      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, data);
      } else {
        await api.post('/admin/products', data);
      }
      setShowForm(false);
      setEditProduct(null);
      setForm({ name: '', description: '', price: '', image_url: '', category_id: '1', sizes: 'S,M,L,XL', stock: '10' });
      loadData();
    } catch (e: any) {
      alert(e.error || 'Failed to save product');
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
      sizes: Array.isArray(p.sizes) ? p.sizes.join(',') : '',
      stock: String(p.stock),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadData();
    } catch {}
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      loadData();
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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === 'products' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            Products ({products.length})
          </button>
          <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg font-medium text-sm ${tab === 'orders' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {tab === 'products' && (
        <div>
          <button onClick={() => { setShowForm(true); setEditProduct(null); setForm({ name: '', description: '', price: '', image_url: '', category_id: '1', sizes: 'S,M,L,XL', stock: '10' }); }}
            className="btn-primary mb-6">+ Add Product</button>

          {showForm && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">{editProduct ? 'Edit Product' : 'New Product'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Product Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                <input className="input-field" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
                <input className="input-field" placeholder="Image URL (external or local path)" value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} />
                <select className="input-field" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input className="input-field" placeholder="Sizes (comma-separated)" value={form.sizes} onChange={(e) => setForm({...form, sizes: e.target.value})} />
                <input className="input-field" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
                <textarea className="input-field md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveProduct} className="btn-primary">Save</button>
                <button onClick={() => { setShowForm(false); setEditProduct(null); }} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">ID</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Image</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Price</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Stock</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">{p.id}</td>
                    <td className="py-3 px-2"><img src={p.image_url} className="w-10 h-10 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }} /></td>
                    <td className="py-3 px-2 font-medium">{p.name}</td>
                    <td className="py-3 px-2">${Number(p.price).toFixed(2)}</td>
                    <td className="py-3 px-2">{p.stock}</td>
                    <td className="py-3 px-2">{p.category_name}</td>
                    <td className="py-3 px-2">
                      <button onClick={() => handleEdit(p)} className="text-primary-600 hover:text-primary-700 mr-3 font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <span className="font-semibold">Order #{order.id}</span>
                  <span className="text-gray-400 text-sm ml-3">{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="text-gray-500 text-sm ml-3">{order.user_email || order.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor(order.status)}`}>
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <span className="font-bold">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {order.items?.map((item, idx) => (
                  <div key={idx}>{item.product_name} {item.size && `(${item.size})`} × {item.quantity} — ${(Number(item.price) * item.quantity).toFixed(2)}</div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">{order.full_name} · {order.phone} · {order.address} · {order.payment_method}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
