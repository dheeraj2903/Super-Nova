import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

/* ── Spark icon (inline, matches SVG symbol) ── */
function SparkIcon({ size = 14, color = '#7E6140' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  );
}

export default function Navbar({
  searchQuery,
  onSearch,
  cartCount,
  onCartClick,
  onBuddyClick,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [prevCount, setPrevCount] = useState(cartCount);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const bounceTimer = useRef(null);

  /* ── Glassmorphic blur on scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cart badge bounce when count increases ── */
  useEffect(() => {
    if (cartCount > prevCount) {
      setBadgeBounce(true);
      clearTimeout(bounceTimer.current);
      bounceTimer.current = setTimeout(() => setBadgeBounce(false), 500);
    }
    setPrevCount(cartCount);
    return () => clearTimeout(bounceTimer.current);
  }, [cartCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Wordmark */}
        <a href="#top" className="navbar__wordmark">
          Kart<span>IQ</span>
        </a>

        {/* Search pill */}
        <div className="navbar__search">
          <svg
            className="navbar__search-icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>

          <input
            className="navbar__search-input"
            type="search"
            aria-label="Search products"
            placeholder="Search products, brands and categories"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />

          <button
            className="navbar__ai-pill"
            onClick={onBuddyClick}
            aria-label="Ask AI-Buddy"
          >
            <SparkIcon />
            <span>Ask AI-Buddy</span>
          </button>
        </div>

        {/* Right nav */}
        <nav className="navbar__nav">
          <a className="navbar__link" href="#shop-grid">
            Deals
          </a>
          <a className="navbar__link" href="#top">
            Account
          </a>
          <button className="navbar__cart" onClick={onCartClick} aria-label="Open cart">
            Cart&nbsp;(
            <span
              className={`navbar__cart-badge${badgeBounce ? ' bounce' : ''}`}
              key={cartCount}
            >
              {cartCount}
            </span>
            )
          </button>
        </nav>
      </div>
    </header>
  );
}
