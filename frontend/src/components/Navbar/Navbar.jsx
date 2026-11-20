import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, X } from 'lucide-react';
import { mockProducts, categories } from '../../data/mockProducts';
import { useDebounce } from '../../hooks/useStorefront';
import styles from './Navbar.module.scss';

export default function Navbar({ cartCount, onCartClick, onBuddyClick, onSearch, searchQuery }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [isCompactSearch, setIsCompactSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1100;
    }
    return false;
  });
  const debouncedQuery = useDebounce(localQuery, 280);
  const searchRef = useRef(null);

  // Sync current path on popstate
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const isActiveRoute = (path) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return (
      currentPath === path ||
      currentPath.startsWith(path + '/') ||
      currentPath.startsWith(path + '?')
    );
  };

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
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setSearchFocused(false);
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
          {/* ── Left: Wordmark ── */}
          <div className={styles.left}>
            <a href="/" className={styles.wordmark}>
              SUPERNOVA<span className={styles.dot}>.</span>
            </a>
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
                    <div className={styles.catGrid}>
                      {categories.map((c) => (
                        <button key={c.id} className={styles.catGridItem}>
                          <img src={c.image} alt={c.name} />
                          <span>{c.name}</span>
                        </button>
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
              className={`${styles.navLink} ${isActiveRoute('/') ? styles.navLinkActive : ''}`}
            >
              Home
            </a>
            <a
              href="/products"
              className={`${styles.navLink} ${isActiveRoute('/products') ? styles.navLinkActive : ''}`}
            >
              Products
            </a>
            <a
              href="/deals"
              className={`${styles.navLink} ${isActiveRoute('/deals') ? styles.navLinkActive : ''}`}
            >
              Deals
            </a>

            <button className={styles.cartBtn} onClick={onCartClick} aria-label="Open cart">
              <ShoppingCart size={15} strokeWidth={2} />
              Cart
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
