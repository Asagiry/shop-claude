import { Link } from 'react-router-dom';
import { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="card group cursor-pointer">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image'; }}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-lg">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">{product.category_name}</span>
        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">Sold Out</span>
          )}
        </div>
      </div>
    </Link>
  );
}
