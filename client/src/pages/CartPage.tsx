import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total, exportCart, importCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [importStr, setImportStr] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ full_name: '', address: '', phone: '', payment_method: 'card' });
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        address: prev.address || user.address || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleImport = () => {
    if (!importStr.trim()) return;
    if (importCart(importStr.trim())) {
      setImportMsg('Cart imported successfully!');
      setImportStr('');
    } else {
      setImportMsg('Invalid cart data. Please check the string.');
    }
    setTimeout(() => setImportMsg(''), 3000);
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportCart()).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
  };

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!checkoutForm.full_name || !checkoutForm.address || !checkoutForm.phone) {
      setOrderError('Please fill in all required fields'); return;
    }
    setSubmitting(true);
    setOrderError('');
    try {
      await api.post('/orders', {
        items: items.map(i => ({ product_id: i.product_id, size: i.size, quantity: i.quantity })),
        ...checkoutForm
      });
      clearCart();
      navigate('/orders');
    } catch (e: any) {
      setOrderError(e.error || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Discover our amazing indie game merchandise!</p>
        <Link to="/" className="btn-primary inline-block">Browse Catalog</Link>

        <div className="mt-10 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-700 mb-2">Import Cart</h3>
          <div className="flex gap-2">
            <input className="input-field text-sm" placeholder="Paste base64 cart string..." value={importStr} onChange={(e) => setImportStr(e.target.value)} />
            <button onClick={handleImport} disabled={!importStr.trim()} className="btn-secondary text-sm whitespace-nowrap">Import</button>
          </div>
          {importMsg && <p className={`text-sm mt-2 ${importMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{importMsg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-gray-500">{items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
      </div>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={`${item.product_id}-${item.size}`} className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            <Link to={`/product/${item.product_id}`}>
              <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Img'; }} />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{item.name}</Link>
              {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
              <p className="font-bold text-primary-600">${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-medium">−</button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-medium">+</button>
            </div>
            <p className="font-bold text-gray-900 w-24 text-right">${(Number(item.price) * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(item.product_id, item.size)} className="text-gray-400 hover:text-red-500 p-1 transition-colors" title="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setShowExport(!showExport)} className="btn-secondary text-sm">
          {showExport ? 'Hide' : 'Export / Import'}
        </button>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">Clear Cart</button>
      </div>

      {showExport && (
        <div className="card p-5 mb-6 space-y-4 animate-slide-up">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Export Cart</label>
            <div className="flex gap-2">
              <input className="input-field text-xs font-mono" readOnly value={exportCart()} onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={handleCopyExport} className="btn-secondary text-sm whitespace-nowrap">
                {exportCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Import Cart</label>
            <div className="flex gap-2">
              <input className="input-field text-sm" placeholder="Paste base64 cart string..." value={importStr} onChange={(e) => setImportStr(e.target.value)} />
              <button onClick={handleImport} disabled={!importStr.trim()} className="btn-secondary text-sm whitespace-nowrap">Import</button>
            </div>
            {importMsg && <p className={`text-sm mt-1 ${importMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{importMsg}</p>}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <span className="text-xl font-semibold text-gray-700">Order Total</span>
          <span className="text-3xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
        </div>

        {!showCheckout ? (
          <button onClick={() => { if (!user) navigate('/login'); else setShowCheckout(true); }}
            className="w-full btn-primary py-3 text-lg">
            {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
          </button>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <h3 className="font-semibold text-lg text-gray-900">Delivery Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input-field" placeholder="John Smith" value={checkoutForm.full_name} onChange={(e) => setCheckoutForm({...checkoutForm, full_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <input className="input-field" placeholder="123 Main St, City, Country" value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input className="input-field" placeholder="+1-555-0100" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select className="input-field" value={checkoutForm.payment_method} onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})}>
                <option value="card">Credit Card (Mock)</option>
                <option value="cash">Cash on Delivery</option>
                <option value="paypal">PayPal (Mock)</option>
              </select>
            </div>
            {orderError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{orderError}</div>}
            <div className="flex gap-3 pt-2">
              <button onClick={handleCheckout} disabled={submitting} className="flex-1 btn-primary py-3 text-lg">
                {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
              <button onClick={() => setShowCheckout(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
