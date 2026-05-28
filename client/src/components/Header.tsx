import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">⛏️</span>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Vibe Miner Shop
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>Catalog</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={`font-medium transition-colors ${location.pathname === '/admin' ? 'text-accent-600' : 'text-gray-600 hover:text-accent-600'}`}>Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">{user.username[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline font-medium">{user.username}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-accent-600 hover:bg-gray-50">Admin Panel</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2 animate-fade-in">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Catalog</Link>
            <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Cart {itemCount > 0 && `(${itemCount})`}</Link>
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Profile</Link>
                <Link to="/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">My Orders</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 text-accent-600 hover:bg-gray-50 rounded-lg font-medium">Admin Panel</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg font-medium">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Sign In</Link>
                <Link to="/register" className="block px-3 py-2 text-primary-600 hover:bg-gray-50 rounded-lg font-medium">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
