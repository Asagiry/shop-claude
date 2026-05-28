import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my').then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [user]);

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No orders yet</p>
          <p className="text-gray-400 mt-2">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="font-semibold text-gray-900">Order #{order.id}</span>
                  <span className="text-gray-400 text-sm ml-3">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product_name} {item.size && `(${item.size})`} × {item.quantity}</span>
                    <span className="text-gray-900 font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 text-sm text-gray-500">
                <p>{order.full_name} · {order.phone} · {order.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
