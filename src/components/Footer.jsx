import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const customerCare = [
    { label: 'My Account', to: '/profile' },
    { label: 'My Orders', to: '/my-orders' },
    { label: 'Return Policy', to: '/returns' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
  ];

  return (
    <footer style={{ backgroundColor: '#1B6B3A' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Column 1: Brand + Social ── */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center">
              <span className="inline-flex items-center rounded-xl bg-white px-1 py-1">
              <img
                src="/Kerala Yard.svg"
                alt="Kerala Yard"
                className="h-10 w-auto object-contain"
                style={{ height: '60px', width: 'auto' }}
              />
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-white/75 max-w-xs">
              Bringing the finest produce from God's Own Country straight to your
              doorstep. Fresh. Natural. Kerala.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: <FaFacebookF size={14} />, href: 'https://facebook.com', label: 'Facebook' },
                { icon: <FaInstagram size={14} />, href: 'https://instagram.com', label: 'Instagram' },
                { icon: <FaTwitter size={14} />, href: 'https://twitter.com', label: 'Twitter' },
                { icon: <FaYoutube size={14} />, href: 'https://youtube.com', label: 'YouTube' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#D4A017')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h3
              className="text-base font-semibold mb-5 pb-2 border-b"
              style={{ borderColor: 'rgba(212,160,23,0.5)', color: '#D4A017' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-white/75 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    › {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Customer Care ── */}
          <div>
            <h3
              className="text-base font-semibold mb-5 pb-2 border-b"
              style={{ borderColor: 'rgba(212,160,23,0.5)', color: '#D4A017' }}
            >
              Customer Care
            </h3>
            <ul className="space-y-2">
              {customerCare.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-white/75 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    › {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact Info ── */}
          <div>
            <h3
              className="text-base font-semibold mb-5 pb-2 border-b"
              style={{ borderColor: 'rgba(212,160,23,0.5)', color: '#D4A017' }}
            >
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/75">
                <FaMapMarkerAlt className="mt-1 shrink-0" style={{ color: '#D4A017' }} />
                <span>
                  Kerala Yard HQ,<br />
                  MG Road, Ernakulam,<br />
                  Kerala – 682 011, India
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/75">
                <FaPhoneAlt className="shrink-0" style={{ color: '#D4A017' }} />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/75">
                <FaEnvelope className="shrink-0" style={{ color: '#D4A017' }} />
                <a
                  href="mailto:support@keralayard.com"
                  className="hover:text-white transition-colors"
                >
                  support@keralayard.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div
        className="border-t text-center py-4 text-xs text-white/50"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Kerala Yard. All rights reserved.</span>
          <span>
            Made with{' '}
            <span style={{ color: '#D4A017' }}>♥</span>
            {' '}in God's Own Country
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
