import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, ChevronDown, Zap, X } from 'lucide-react';
import { mockProducts, categories } from '../../data/mockProducts';
import { useDebounce } from '../../hooks/useStorefront';
import styles from './Navbar.module.scss';

export default function Navbar({ cartCount, onCartClick, onBuddyClick, onSearch, searchQuery }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isCompactSearch, setIsCompactSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1100;
    }
    return false;
  });
  const debouncedQuery = useDebounce(localQuery, 280);
  const searchRef = useRef(null);
  const catRef = useRef(null);
  const accountRef = useRef(null);

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
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false);
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
        setCatOpen(false);
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

  const scrollToDeals = () => {
    const el = document.getElementById('shop-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          {/* ── Left: Wordmark + Categories ── */}
          <div className={styles.left}>
            <a href="/" className={styles.wordmark}>
              SUPERNOVA<span className={styles.dot}>.</span>
            </a>

            <div className={styles.catWrapper} ref={catRef}>
              <button
                className={styles.catBtn}
                onClick={() => setCatOpen((o) => !o)}
                aria-expanded={catOpen}
              >
                Categories
                <ChevronDown size={14} strokeWidth={2} className={catOpen ? styles.chevronOpen : ''} />
              </button>

              {catOpen && (
                <div className={styles.catDropdown}>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      className={styles.catItem}
                      onClick={() => {
                        setCatOpen(false);
                        const el = document.getElementById('shop-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <img src={c.image} alt={c.name} className={styles.catItemImg} />
                      <span>{c.name}</span>
                      <span className={styles.catCount}>{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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

          {/* ── Right: Nav actions ── */}
          <nav className={styles.right}>
            <button className={styles.navLink} onClick={scrollToDeals}>Deals</button>

            {/* Account dropdown */}
            <div className={styles.accountWrap} ref={accountRef}>
              <button
                className={styles.navLink}
                onClick={() => setAccountOpen((o) => !o)}
              >
                <User size={15} strokeWidth={2} />
                Account
                <ChevronDown size={13} strokeWidth={2} className={accountOpen ? styles.chevronOpen : ''} />
              </button>
              {accountOpen && (
                <div className={styles.accountDropdown}>
                  {['My Orders & Live Tracking', 'Wishlist', 'Partner Dashboard', 'Login / Logout'].map((item) => (
                    <button key={item} className={styles.accountItem}>{item}</button>
                  ))}
                </div>
              )}
            </div>

            <button className={styles.cartBtn} onClick={onCartClick}>
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
