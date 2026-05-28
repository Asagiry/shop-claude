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

  const hasFilters = category || sort || size || search || minPrice || maxPrice;

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

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent leading-tight">
          Indie Game Merchandise
        </h1>
        <p className="mt-3 text-gray-500 text-lg">Wear the vibe. Mine the style. Level up your wardrobe.</p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-lg mx-auto relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          className="input-field pl-11"
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button onClick={() => updateFilter('category', '')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All Products
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => updateFilter('category', cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat.slug ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & size/price filters */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center items-center">
        <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field w-auto text-sm">
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name">Name A-Z</option>
          <option value="newest">Newest First</option>
        </select>

        <select value={size} onChange={(e) => updateFilter('size', e.target.value)}
          className="input-field w-auto text-sm">
          <option value="">All Sizes</option>
          {['S', 'M', 'L', 'XL', 'XXL', 'A3', 'A2', 'A1'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input type="number" placeholder="Min $" className="input-field w-24 text-sm" value={minPrice}
          onChange={(e) => updateFilter('min_price', e.target.value)} min="0" />
        <input type="number" placeholder="Max $" className="input-field w-24 text-sm" value={maxPrice}
          onChange={(e) => updateFilter('max_price', e.target.value)} min="0" />

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length} product{products.length !== 1 ? 's' : ''} found
          {category && ` in ${categories.find(c => c.slug === category)?.name || category}`}
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl font-semibold text-gray-700">No products found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Show All Products</button>
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
