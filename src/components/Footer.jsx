import { Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from 'react-icons/fa';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
  ];

  const customerCare = [
    { label: 'My Account', to: '/profile' },
    { label: 'My Orders', to: '/my-orders' },
  ];

  return (
    <footer style={{ backgroundColor: '#1B6B3A' }} className="text-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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

            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: <FaFacebookF size={14} />, href: 'https://www.facebook.com/share/1BRye8JKtS/', label: 'Facebook' },
                { icon: <FaInstagram size={14} />, href: 'https://www.instagram.com/kerala_yard?igsh=MWQ1djRxdnc1dnlqbw==', label: 'Instagram' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 bg-white/10 hover:bg-[#D4A017]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

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
                    &gt; {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                    &gt; {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                  Ernakulam,<br />
                  Kerala - India
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/75">
                <FaPhoneAlt className="shrink-0" style={{ color: '#D4A017' }} />
                <a href="tel:+918866860624" className="hover:text-white transition-colors">
                  +91 8866860624
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/75">
                <FaEnvelope className="shrink-0" style={{ color: '#D4A017' }} />
                <a
                  href="mailto:team.keralayard@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  team.keralayard@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/70 leading-relaxed">
              <p>© {new Date().getFullYear()} Kerala Yard. All rights reserved.</p>
              <p className="mt-1">
                Made with <span style={{ color: '#D4A017' }}>heart</span> in God's Own Country
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
