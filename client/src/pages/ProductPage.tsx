import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((p) => { setProduct(p); if (p.sizes?.length) setSelectedSize(p.sizes[0]); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 font-medium mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image'; }} />
        </div>

        <div>
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">{product.category_name}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-3xl font-extrabold text-gray-900 mt-4">${Number(product.price).toFixed(2)}</p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                ✗ Out of Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === s ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">−</button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
            </div>
          </div>

          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className={`mt-8 w-full py-3 rounded-xl font-semibold text-lg transition-all ${
              added ? 'bg-green-500 text-white' :
              product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
              'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
            }`}>
            {added ? '✓ Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
