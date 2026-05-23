import { useEffect, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { login, setShowUserLogin } = useAppContext();
  const modalRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowUserLogin(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowUserLogin(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setShowUserLogin]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await login();
      setShowUserLogin(false);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      {/* ── Modal Card ── */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #1B6B3A, #D4A017)' }} />

        {/* Close button */}
        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close login modal"
        >
          <IoClose size={22} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center px-8 pt-8 pb-10 gap-6">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Kerala Yard"
            className="h-16 w-auto object-contain"
            style={{ height: '64px', width: 'auto' }}
          />

          {/* Heading */}
          <div className="text-center">
            <h2
              id="login-title"
              className="text-2xl font-bold"
              style={{ color: '#1B6B3A' }}
            >
              Sign in to Kerala Yard
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Access your cart, track orders, and enjoy exclusive offers from God's Own Country.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign-In button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 shadow-sm group"
          >
            <FcGoogle size={24} />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
              Sign in with Google
            </span>
          </button>

          {/* Fine print */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600" style={{ color: '#1B6B3A' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-gray-600" style={{ color: '#1B6B3A' }}>
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
