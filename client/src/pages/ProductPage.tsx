import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    setLoading(true);
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Catalog</Link>
        <span>/</span>
        <Link to={`/?category=${product.category_slug}`} className="hover:text-primary-600 transition-colors">{product.category_name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image'; }} />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">{product.category_name}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-3xl font-extrabold text-gray-900 mt-4">${Number(product.price).toFixed(2)}</p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedSize === s ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">−</button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-10 w-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">+</button>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all ${
                added ? 'bg-green-500 text-white shadow-green-200 shadow-lg' :
                product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
              }`}>
              {added ? '✓ Added to Cart!' : product.stock === 0 ? 'Out of Stock' : `Add to Cart — $${(Number(product.price) * quantity).toFixed(2)}`}
            </button>

            {added && (
              <Link to="/cart" className="block text-center mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
                View Cart →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
