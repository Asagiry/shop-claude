import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const size = searchParams.get('size') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  useEffect(() => {
    api.get('/products/categories').then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (size) params.set('size', size);
    if (search) params.set('search', search);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);

    api.get(`/products?${params.toString()}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sort, size, search, minPrice, maxPrice]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent">
          Indie Game Merchandise
        </h1>
        <p className="mt-2 text-gray-600 text-lg">Wear the vibe. Mine the style.</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="input-field max-w-md mx-auto block"
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        <button onClick={() => updateFilter('category', '')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => updateFilter('category', cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat.slug ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8 justify-center items-center">
        <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field w-auto text-sm">
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
          <option value="newest">Newest</option>
        </select>

        <select value={size} onChange={(e) => updateFilter('size', e.target.value)}
          className="input-field w-auto text-sm">
          <option value="">All Sizes</option>
          {['S', 'M', 'L', 'XL', 'XXL', 'A3', 'A2', 'A1'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input type="number" placeholder="Min $" className="input-field w-24 text-sm" value={minPrice}
          onChange={(e) => updateFilter('min_price', e.target.value)} />
        <input type="number" placeholder="Max $" className="input-field w-24 text-sm" value={maxPrice}
          onChange={(e) => updateFilter('max_price', e.target.value)} />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No products found</p>
          <p className="mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
