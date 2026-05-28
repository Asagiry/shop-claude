export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-3">
              <span>⛏️</span> Vibe Miner Shop
            </h3>
            <p className="text-sm">Your one-stop shop for indie game merchandise. Wear the vibe, mine the style.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Catalog</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">Cart</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profile</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categories</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/?category=tshirts" className="hover:text-white transition-colors">T-Shirts</a></li>
              <li><a href="/?category=posters" className="hover:text-white transition-colors">Posters</a></li>
              <li><a href="/?category=hoodies" className="hover:text-white transition-colors">Hoodies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2024 Vibe Miner Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
