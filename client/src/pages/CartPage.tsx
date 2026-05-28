import { useState } from 'react';
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
  const [checkoutForm, setCheckoutForm] = useState({ full_name: user?.full_name || '', address: user?.address || '', phone: user?.phone || '', payment_method: 'card' });
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImport = () => {
    if (importCart(importStr)) {
      setImportMsg('Cart imported successfully!');
      setImportStr('');
    } else {
      setImportMsg('Invalid cart data');
    }
    setTimeout(() => setImportMsg(''), 3000);
  };

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (!checkoutForm.full_name || !checkoutForm.address || !checkoutForm.phone) {
      setOrderError('Please fill all fields'); return;
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
      setOrderError(e.error || 'Checkout failed');
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
        <Link to="/" className="btn-primary">Browse Catalog</Link>

        <div className="mt-10 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-700 mb-2">Import Cart</h3>
          <div className="flex gap-2">
            <input className="input-field text-sm" placeholder="Paste base64 cart string..." value={importStr} onChange={(e) => setImportStr(e.target.value)} />
            <button onClick={handleImport} className="btn-secondary text-sm whitespace-nowrap">Import</button>
          </div>
          {importMsg && <p className="text-sm mt-2 text-primary-600">{importMsg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={`${item.product_id}-${item.size}`} className="card flex items-center gap-4 p-4">
            <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80'; }} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
              <p className="font-bold text-primary-600">${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)} className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm">−</button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)} className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm">+</button>
            </div>
            <p className="font-bold text-gray-900 w-20 text-right">${(Number(item.price) * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(item.product_id, item.size)} className="text-red-400 hover:text-red-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Cart actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setShowExport(!showExport)} className="btn-secondary text-sm">Export/Import Cart</button>
        <button onClick={clearCart} className="btn-danger text-sm">Clear Cart</button>
      </div>

      {showExport && (
        <div className="card p-4 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export (copy this string)</label>
            <input className="input-field text-xs font-mono" readOnly value={exportCart()} onClick={(e) => (e.target as HTMLInputElement).select()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import cart from string</label>
            <div className="flex gap-2">
              <input className="input-field text-sm" placeholder="Paste base64..." value={importStr} onChange={(e) => setImportStr(e.target.value)} />
              <button onClick={handleImport} className="btn-secondary text-sm">Import</button>
            </div>
            {importMsg && <p className="text-sm text-primary-600">{importMsg}</p>}
          </div>
        </div>
      )}

      {/* Total & Checkout */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold text-gray-700">Total</span>
          <span className="text-3xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
        </div>

        {!showCheckout ? (
          <button onClick={() => { if (!user) navigate('/login'); else setShowCheckout(true); }}
            className="w-full btn-primary py-3 text-lg">
            {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Checkout Details</h3>
            <input className="input-field" placeholder="Full Name" value={checkoutForm.full_name} onChange={(e) => setCheckoutForm({...checkoutForm, full_name: e.target.value})} />
            <input className="input-field" placeholder="Delivery Address" value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} />
            <input className="input-field" placeholder="Phone Number" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
            <select className="input-field" value={checkoutForm.payment_method} onChange={(e) => setCheckoutForm({...checkoutForm, payment_method: e.target.value})}>
              <option value="card">Credit Card (Mock)</option>
              <option value="cash">Cash on Delivery</option>
              <option value="paypal">PayPal (Mock)</option>
            </select>
            {orderError && <p className="text-red-500 text-sm">{orderError}</p>}
            <button onClick={handleCheckout} disabled={submitting} className="w-full btn-primary py-3 text-lg">
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
