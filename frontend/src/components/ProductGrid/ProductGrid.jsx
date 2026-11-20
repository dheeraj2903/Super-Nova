import { useState, useEffect, useRef } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { mockProducts } from '../../data/mockProducts';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import ProductCard from '../ProductCard/ProductCard';
import Toast from '../Toast/Toast';
import styles from './ProductGrid.module.scss';

const SORT_OPTIONS = ['Featured', 'Price: Low → High', 'Price: High → Low', 'Top Rated'];

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skelImg} />
      <div className={styles.skelBody}>
        <div className={styles.skelRow} style={{ width: '55%', height: '12px' }} />
        <div className={styles.skelRow} style={{ width: '90%', height: '16px' }} />
        <div className={styles.skelRow} style={{ width: '75%', height: '14px' }} />
        <div className={styles.skelRow} style={{ width: '40%', height: '20px', marginTop: '6px' }} />
        <div className={styles.skelActions}>
          <div className={styles.skelBtn} />
          <div className={styles.skelBtn} />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ activeCategory, searchQuery, onAddToCart, onBuddyClick }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('Featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [toast, setToast] = useState(null);
  const sortRef = useRef(null);
  const catFilterRef = useRef(null);
  const sectionRef = useRevealOnScroll(0.05);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // Filter + sort
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...mockProducts];

      if (activeCategory && activeCategory !== 'All Categories') {
        filtered = filtered.filter((p) => p.category === activeCategory);
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      if (priceMin) filtered = filtered.filter((p) => p.price >= Number(priceMin));
      if (priceMax) filtered = filtered.filter((p) => p.price <= Number(priceMax));

      if (sort === 'Price: Low → High') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'Price: High → Low') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'Top Rated') filtered.sort((a, b) => b.rating - a.rating);

      setProducts(filtered);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, sort, priceMin, priceMax]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (catFilterRef.current && !catFilterRef.current.contains(e.target)) setCatFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const categories = ['All Categories', 'Electronics', 'Audio', 'Footwear', 'Bags', 'Home Decor', 'Accessories'];

  return (
    <>
      <section id="shop-grid" className={`${styles.section} container`} ref={sectionRef}>
        {/* Header row */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              Trending &amp; Hot Deals
              <span className={styles.liveDot}>• Live Feed</span>
            </h2>
            <p className={styles.subtitle}>
              Top-rated picks and limited-time deals across tech &amp; everyday essentials
            </p>
          </div>

          {/* Filter controls */}
          <div className={styles.controls}>
            {/* Category filter */}
            <div className={styles.filterWrap} ref={catFilterRef}>
              <button
                className={styles.filterBtn}
                onClick={() => setCatFilterOpen((o) => !o)}
              >
                {activeCategory || 'All Categories'}
                <ChevronDown size={13} strokeWidth={2} className={catFilterOpen ? styles.chevronOpen : ''} />
              </button>
              {catFilterOpen && (
                <div className={styles.filterDropdown}>
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={`${styles.filterItem} ${(activeCategory || 'All Categories') === c ? styles.filterActive : ''}`}
                      onClick={() => setCatFilterOpen(false)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price range */}
            <div className={styles.priceRange}>
              <span className={styles.priceLabel}>₹</span>
              <input
                type="number"
                placeholder="Min"
                className={styles.priceInput}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className={styles.priceDash}>–</span>
              <input
                type="number"
                placeholder="Max"
                className={styles.priceInput}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className={styles.filterWrap} ref={sortRef}>
              <button
                className={styles.filterBtn}
                onClick={() => setSortOpen((o) => !o)}
              >
                Sort: {sort}
                <ChevronDown size={13} strokeWidth={2} className={sortOpen ? styles.chevronOpen : ''} />
              </button>
              {sortOpen && (
                <div className={styles.filterDropdown}>
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o}
                      className={`${styles.filterItem} ${sort === o ? styles.filterActive : ''}`}
                      onClick={() => { setSort(o); setSortOpen(false); }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
            ? products.map((p, i) => (
                <div
                  key={p._id}
                  className={styles.cardReveal}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={onAddToCart}
                    onShowToast={showToast}
                  />
                </div>
              ))
            : (
              <div className={styles.empty}>
                <p>No products found. Try adjusting your filters.</p>
                <button
                  className={styles.aiBtn}
                  onClick={onBuddyClick}
                >
                  ✦ Ask AI-Buddy for suggestions
                </button>
              </div>
            )
          }
        </div>
      </section>

      {toast && <Toast message={toast} />}
    </>
  );
}
