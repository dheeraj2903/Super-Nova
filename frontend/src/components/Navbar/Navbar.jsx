import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, X } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { mockProducts, categories } from '../../data/mockProducts';
import { useDebounce } from '../../hooks/useStorefront';
import styles from './Navbar.module.scss';

// Hook to sync location pathname strictly across popstate and client-side pushState
function useLocation() {
  const [location, setLocation] = useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
  }));

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation({
        pathname: window.location.pathname || '/',
      });
    };

    window.addEventListener('popstate', handleLocationChange);

    // Intercept history.pushState & history.replaceState so client-side navigation instantly updates
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      handleLocationChange();
      return result;
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return location;
}

export default function Navbar({ cartCount, onCartClick, onBuddyClick, onSearch, searchQuery }) {
  const { pathname } = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(35);
  const [isCompactSearch, setIsCompactSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1100;
    }
    return false;
  });
  const debouncedQuery = useDebounce(localQuery, 280);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  // Scroll-driven underline scaling against full document scrollable height (35% at top to 100% at bottom)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollY / scrollableHeight)) : 0;
      setScrollPercent(Math.round(35 + progress * 65));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // 100% route-locked active tab determination (no local state)
  const isHomeActive = pathname === '/' || pathname === '';
  const isProductsActive = pathname.startsWith('/products');
  const isDealsActive = pathname.startsWith('/deals');

  // Responsive placeholder
  useEffect(() => {
    function handleResize() {
      setIsCompactSearch(window.innerWidth < 1100);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync debounced query upward
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const filteredProducts = debouncedQuery.trim()
    ? mockProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const trendingPills = ['Headphones', 'Running Shoes', 'GaN Charger', 'Smart Watch', 'Leather Bag'];

  return (
    <>
      {/* Backdrop when search is focused */}
      {searchFocused && (
        <div
          className={styles.backdrop}
          onClick={() => setSearchFocused(false)}
        />
      )}

      <header className={styles.navbar}>
        <div className={`${styles.inner} container`}>
          {/* ── Left: Brand Logo ── */}
          <div className={styles.left}>
            <BrandLogo />
          </div>

          {/* ── Center: Search ── */}
          <div
            className={`${styles.searchWrap} ${searchFocused ? styles.searchFocused : ''}`}
            ref={searchRef}
          >
            <Search size={15} strokeWidth={2} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={isCompactSearch ? 'Search...' : 'Search products...'}
              className={styles.searchInput}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              aria-label="Search"
            />
            {localQuery && (
              <button
                className={styles.clearBtn}
                onClick={() => { setLocalQuery(''); onSearch(''); }}
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}

            {/* Search dropdown */}
            {searchFocused && (
              <div className={styles.searchDropdown}>
                {!debouncedQuery.trim() ? (
                  <>
                    <p className={styles.dropLabel}>Popular Categories</p>
                    <div className={styles.categoryPills}>
                      {categories.map((c) => (
                        <a
                          key={c.id}
                          href={`/products?category=${c.id}`}
                          className={styles.catPill}
                          onClick={() => setSearchFocused(false)}
                        >
                          {c.name}
                        </a>
                      ))}
                    </div>
                    <p className={styles.dropLabel} style={{ marginTop: '16px' }}>Trending</p>
                    <div className={styles.trendingPills}>
                      {trendingPills.map((p) => (
                        <button
                          key={p}
                          className={styles.trendPill}
                          onClick={() => { setLocalQuery(p); setSearchFocused(false); }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {filteredProducts.length > 0 ? (
                      <>
                        <p className={styles.dropLabel}>Products</p>
                        {filteredProducts.map((p) => (
                          <div key={p._id} className={styles.miniCard}>
                            <img src={p.image} alt={p.title} className={styles.miniImg} />
                            <div className={styles.miniInfo}>
                              <span className={styles.miniTitle}>{p.title}</span>
                              <span className={styles.miniMeta}>
                                <span style={{ color: '#F59E0B' }}>★</span> {p.rating} &nbsp;·&nbsp; ₹{p.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className={styles.noResults}>No products matched "{debouncedQuery}"</p>
                    )}
                    <button
                      className={styles.aiBuddyBtn}
                      onClick={() => { setSearchFocused(false); onBuddyClick(); }}
                    >
                      ✦ Ask AI-Buddy about "{debouncedQuery}"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Clean 3 Nav Links + Cart ── */}
          <nav className={styles.right} aria-label="Main navigation">
            <a
              href="/"
              className={`${styles.navLink} ${isHomeActive ? styles.navLinkActive : ''}`}
              style={isHomeActive ? { '--underline-width': `${scrollPercent}%` } : undefined}
            >
              Home
            </a>
            <a
              href="/products"
              className={`${styles.navLink} ${isProductsActive ? styles.navLinkActive : ''}`}
              style={isProductsActive ? { '--underline-width': `${scrollPercent}%` } : undefined}
            >
              Products
            </a>
            <a
              href="/deals"
              className={`${styles.navLink} ${isDealsActive ? styles.navLinkActive : ''}`}
              style={isDealsActive ? { '--underline-width': `${scrollPercent}%` } : undefined}
            >
              Deals
            </a>

            <button className={styles.cartBtn} onClick={onCartClick} aria-label="Open cart">
              <ShoppingCart size={15} strokeWidth={2} />
              Cart
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            {/* Profile Avatar & Account Dropdown */}
            <div className={styles.accountWrap} ref={accountRef}>
              <button
                type="button"
                className={`${styles.avatarBtn} ${accountOpen ? styles.avatarActive : ''}`}
                onClick={() => setAccountOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                <User size={16} strokeWidth={2} />
              </button>

              {accountOpen && (
                <div className={styles.accountDropdown} role="menu">
                  <a
                    href="/login"
                    className={`${styles.accountItem} ${styles.accountHighlight}`}
                    onClick={() => setAccountOpen(false)}
                    role="menuitem"
                  >
                    Sign In / Create Account
                  </a>
                  <a
                    href="/orders"
                    className={styles.accountItem}
                    onClick={() => setAccountOpen(false)}
                    role="menuitem"
                  >
                    My Orders &amp; Live Tracking
                  </a>
                  <a
                    href="/wishlist"
                    className={styles.accountItem}
                    onClick={() => setAccountOpen(false)}
                    role="menuitem"
                  >
                    Wishlist
                  </a>
                  <a
                    href="/partner"
                    className={styles.accountItem}
                    onClick={() => setAccountOpen(false)}
                    role="menuitem"
                  >
                    Partner Dashboard
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
