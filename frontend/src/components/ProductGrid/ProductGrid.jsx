import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Sort by: Latest' },
  { value: 'low',    label: 'Price: Low to High' },
  { value: 'high',   label: 'Price: High to Low' },
];

const CAT_OPTIONS = [
  'All Categories',
  'Electronics',
  'Audio',
  'Footwear',
  'Bags',
  'Home Decor',
  'Accessories',
];

/* ── 8-card shimmer skeleton ── */
function SkeletonGrid() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton-image" />
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--long" />
          <div className="skeleton-line skeleton-line--long" />
          <div className="skeleton-btn" />
        </div>
      ))}
    </>
  );
}

export default function ProductGrid({
  activeCategory,
  searchQuery,
  onAddToCart,
  onBuddyClick,
}) {
  /* ── Local filter/sort state ── */
  const [localCat, setLocalCat]   = useState('All Categories');
  const [minPrice, setMinPrice]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');
  const [sort, setSort]           = useState('latest');

  /* ── API data state ── */
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const debounceTimer = useRef(null);

  /* ── Sync category from CategoryStrip prop ── */
  useEffect(() => {
    setLocalCat(activeCategory);
  }, [activeCategory]);

  /* ── Fetch from /api/products with debounce ── */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (searchQuery)                              params.q         = searchQuery;
    if (localCat !== 'All Categories')            params.category  = localCat;
    if (minPrice && !isNaN(Number(minPrice)))     params.minprice  = minPrice;
    if (maxPrice && !isNaN(Number(maxPrice)))     params.maxprice  = maxPrice;
    if (sort)                                     params.sort      = sort;

    axios
      .get('/api/products', { params })
      .then((res) => {
        let data = res.data?.data ?? [];

        /* Client-side sort fallback (backend may not support all sort params) */
        if (sort === 'low')  data = [...data].sort((a, b) => (a.price?.amount ?? 0) - (b.price?.amount ?? 0));
        if (sort === 'high') data = [...data].sort((a, b) => (b.price?.amount ?? 0) - (a.price?.amount ?? 0));

        setProducts(data);
      })
      .catch((err) => {
        console.error('ProductGrid fetch error:', err);
        setError('Could not load products. Check your network or backend.');
      })
      .finally(() => setLoading(false));
  }, [searchQuery, localCat, minPrice, maxPrice, sort]);

  /* ── Re-fetch whenever deps change (debounced for text inputs) ── */
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fetchProducts, 350);
    return () => clearTimeout(debounceTimer.current);
  }, [fetchProducts]);

  const isEmpty = !loading && !error && products.length === 0;

  return (
    <section id="shop-grid" className="product-grid-section">
      {/* ── Toolbar ── */}
      <div className="product-grid__toolbar">
        <h2 className="product-grid__toolbar-title">Trending &amp; Hot Deals</h2>

        <div className="product-grid__filters">
          {/* Category select */}
          <select
            className="filter-pill"
            aria-label="Category"
            value={localCat}
            onChange={(e) => setLocalCat(e.target.value)}
          >
            {CAT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Min price */}
          <label className="filter-pill filter-pill--price">
            ₹ Min
            <input
              type="number"
              inputMode="numeric"
              aria-label="Minimum price"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </label>

          {/* Max price */}
          <label className="filter-pill filter-pill--price">
            ₹ Max
            <input
              type="number"
              inputMode="numeric"
              aria-label="Maximum price"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>

          {/* Sort */}
          <select
            className="filter-pill"
            aria-label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="no-results">
          <div className="no-results__title">⚠ {error}</div>
          <div className="no-results__sub">The backend may be offline or still starting up.</div>
          <button className="no-results__btn" onClick={fetchProducts}>Retry</button>
        </div>
      )}

      {/* ── Grid ── */}
      {!error && (
        <div className="product-grid__grid">
          {loading ? (
            <SkeletonGrid />
          ) : (
            products.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={onAddToCart} />
            ))
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {isEmpty && (
        <div className="no-results">
          <div className="no-results__title">Nothing matches those filters</div>
          <div className="no-results__sub">
            Widen your price range, or describe what you need in your own words.
          </div>
          <button className="no-results__btn" onClick={onBuddyClick}>
            Ask AI-Buddy to find it
          </button>
        </div>
      )}
    </section>
  );
}
