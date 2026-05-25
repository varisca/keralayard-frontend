import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, setShowUserLogin, getCartCount, cartItems } = useAppContext();
  const navigate = useNavigate();

  const displayUser = user && !user.isStaff ? user : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileOpen(false);
    await logout();
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
  ];

  const activeLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 pb-0.5 ${
      isActive
         ? 'text-[#1B6B3A] border-b-2 border-[#D4A017]'
        : 'text-gray-600 hover:text-[#1B6B3A]'
    }`;

  const cartCount = getCartCount ? getCartCount() : 0;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white shadow-sm">
        {/* ── Delivery location strip ── */}
        <div
          className="hidden md:flex items-center gap-1.5 px-6 py-1 text-xs text-white"
          style={{ backgroundColor: '#1B6B3A' }}
        >
          <MapPin size={12} />
          <span>Delivering to Kerala &amp; major Indian cities</span>
        </div>

        {/* ── Main nav row ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src="/logo.png" alt="Kerala Yard" className="h-50 w-auto object-contain" style={{ height: '70px', width: 'auto' }} />
          </Link>

          {/* ── Desktop center nav links ── */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map(({ label, to }) => (
              <NavLink key={label} to={to} className={activeLinkClass} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop search bar ── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-auto"
          >
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spices, coconut products…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:bg-white transition-all duration-200"
                style={{ '--tw-ring-color': '#1B6B3A55' }}
              />
            </div>
          </form>

          {/* ── Desktop right actions ── */}
          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: '#1B6B3A' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {displayUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  {displayUser.photoURL ? (
                    <img
                      src={displayUser.photoURL}
                      alt={displayUser.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {displayUser.displayName?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {displayUser.displayName || displayUser.email}
                      </p>
                    </div>
                    {[
                      { label: 'My Orders', to: '/orders' },
                      { label: 'My Profile', to: '/profile' },
                    ].map(({ label, to }) => (
                      <Link
                        key={label}
                        to={to}
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50"
                        style={{ color: '#DC2626' }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowUserLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#1B6B3A' }}
              >
                <User size={16} />
                Sign In
              </button>
            )}
          </div>

          {/* ── Mobile: cart + hamburger ── */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: '#1B6B3A' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile slide-down menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border-t border-gray-100 px-4 pt-4 pb-6 flex flex-col gap-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-sm outline-none"
                />
              </div>
            </form>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: '#1B6B3A' } : {}
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile auth */}
            <div className="border-t border-gray-100 pt-3">
              {displayUser ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {displayUser.photoURL ? (
                      <img
                        src={displayUser.photoURL}
                        alt={displayUser.displayName || 'User'}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#1B6B3A' }}
                      >
                        {(displayUser.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {displayUser.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{displayUser.email}</p>
                    </div>
                  </div>
                  {[
                    { label: 'My Orders', to: '/orders' },
                    { label: 'My Profile', to: '/profile' },
                  ].map(({ label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowUserLogin(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: '#1B6B3A' }}
                >
                  <User size={16} />
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content going under fixed navbar */}
      <div className="h-16 md:h-[72px]" />
    </>
  );
};

export default Navbar;
