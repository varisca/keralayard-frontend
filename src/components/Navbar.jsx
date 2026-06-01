import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Grid3X3,
  Home,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, setShowUserLogin, getCartCount, setSearchQuery: setGlobalSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const displayUser = user && !user.isStaff ? user : null;

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
  };

  const handleAccountClick = () => {
    if (displayUser) {
      navigate('/profile');
      return;
    }
    setShowUserLogin(true);
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
  const isAccountActive = location.pathname.startsWith('/profile');

  const bottomNavLinkClass = ({ isActive }) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#1B6B3A] text-white shadow-sm'
        : 'text-gray-500 hover:text-[#1B6B3A]'
    }`;

  const bottomNavIconClass = (isActive) =>
    isActive ? 'text-white' : 'text-gray-500';

  return (
    <>
      <header className="sticky md:fixed top-0 inset-x-0 z-40 bg-white shadow-sm">
        <div
          className="flex items-center gap-1.5 px-6 py-1 text-xs text-white"
          style={{ backgroundColor: '#1B6B3A' }}
        >
          <MapPin size={12} />
          <span>Delivering to Ahmedabad only</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center gap-4">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img
              src="/Kerala Yard.svg"
              alt="Kerala Yard"
              className="w-auto object-contain"
              style={{ height: '70px', width: 'auto' }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map(({ label, to }) => (
              <NavLink key={label} to={to} className={activeLinkClass} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>



          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">
            <Link
              to="/my-orders"
              className="rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#1B6B3A]"
            >
              My Orders
            </Link>

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

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {displayUser.displayName || displayUser.email}
                      </p>
                    </div>
                    {[
                      { label: 'My Orders', to: '/my-orders' },
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
                        Sign Out
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


        </div>


      </header>

      <div className="hidden md:block h-[72px]" />

      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-gray-200 bg-white/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          <NavLink to="/" end className={bottomNavLinkClass}>
            {({ isActive }) => (
              <>
                <Home size={21} strokeWidth={2.2} className={bottomNavIconClass(isActive)} />
                <span className="leading-none">Home</span>
              </>
            )}
          </NavLink>

          <NavLink to="/products" className={bottomNavLinkClass}>
            {({ isActive }) => (
              <>
                <Grid3X3 size={21} strokeWidth={2.2} className={bottomNavIconClass(isActive)} />
                <span className="leading-none">Products</span>
              </>
            )}
          </NavLink>

          <NavLink to="/cart" className={bottomNavLinkClass}>
            {({ isActive }) => (
              <>
                <span className="relative">
                  <ShoppingCart size={21} strokeWidth={2.2} className={bottomNavIconClass(isActive)} />
                  {cartCount > 0 && (
                    <span
                      className={`absolute -right-2.5 -top-2 min-w-[17px] h-[17px] rounded-full px-1 text-[10px] font-bold leading-[17px] text-center ${
                        isActive ? 'bg-white text-[#1B6B3A]' : 'bg-[#1B6B3A] text-white'
                      }`}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="leading-none">Cart</span>
              </>
            )}
          </NavLink>

          <NavLink to="/my-orders" className={bottomNavLinkClass}>
            {({ isActive }) => (
              <>
                <Package size={21} strokeWidth={2.2} className={bottomNavIconClass(isActive)} />
                <span className="leading-none">Orders</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleAccountClick}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
              isAccountActive
                ? 'bg-[#1B6B3A] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1B6B3A]'
            }`}
          >
            <User size={21} strokeWidth={2.2} className={bottomNavIconClass(isAccountActive)} />
            <span className="leading-none">Account</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
