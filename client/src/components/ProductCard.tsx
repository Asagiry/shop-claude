import { Link } from 'react-router-dom';
import { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="card group">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
        />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">{product.category_name}</span>
        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
