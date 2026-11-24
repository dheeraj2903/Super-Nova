import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  X,
  PackageSearch,
} from 'lucide-react';
import { mockProducts, categories as rawCategories } from '../data/mockProducts';
import { GLOBAL_SKELETON_MS } from '../constants/ui';
import ProductCard from '../components/ProductCard/ProductCard';
import Toast from '../components/Toast/Toast';
import styles from './ProductsPage.module.scss';

const SORT_OPTIONS = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Top Rated',
];

const CATEGORY_NAMES = [
  'All Categories',
  'Electronics',
  'Audio',
  'Footwear',
  'Bags',
  'Home Decor',
  'Accessories',
];

const SLUG_TO_NAME = {
  electronics: 'Electronics',
  audio: 'Audio',
  footwear: 'Footwear',
  bags: 'Bags',
  'home-decor': 'Home Decor',
  accessories: 'Accessories',
};

const NAME_TO_SLUG = {
  Electronics: 'electronics',
  Audio: 'audio',
  Footwear: 'footwear',
  Bags: 'bags',
  'Home Decor': 'home-decor',
  Accessories: 'accessories',
};

const ITEMS_PER_PAGE = 6;

export default function ProductsPage({ searchQuery = '', onAddToCart }) {
  // Read category from URL query on initial render
  const getInitialCategory = () => {
    if (typeof window === 'undefined') return 'All Categories';
    const params = new URLSearchParams(window.location.search);
    const catQuery = params.get('category');
    if (!catQuery) return 'All Categories';
    const normalized = catQuery.toLowerCase().trim();
    if (SLUG_TO_NAME[normalized]) return SLUG_TO_NAME[normalized];
    const match = CATEGORY_NAMES.find(
      (c) => c.toLowerCase() === normalized
    );
    return match || 'All Categories';
  };

  const getInitialSearchParam = () => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [urlSearchQuery, setUrlSearchQuery] = useState(getInitialSearchParam);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('Featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [filterLoading, setFilterLoading] = useState(true);

  const effectiveSearch = (urlSearchQuery || searchQuery || '').trim();

  const sortRef = useRef(null);
  const filterTimerRef = useRef(null);

  // Exact 450ms skeleton shimmer on initial mount / refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterLoading(false);
    }, GLOBAL_SKELETON_MS);
    return () => clearTimeout(timer);
  }, []);

  const triggerFilterShimmer = () => {
    setFilterLoading(true);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      setFilterLoading(false);
    }, GLOBAL_SKELETON_MS);
  };

  useEffect(() => {
    return () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  // Sync category and search state when URL changes (popstate)
  useEffect(() => {
    const handlePopState = () => {
      triggerFilterShimmer();
      setSelectedCategory(getInitialCategory());
      setUrlSearchQuery(getInitialSearchParam());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleClearSearch = () => {
    triggerFilterShimmer();
    setUrlSearchQuery('');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('q');
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState({}, '', `/products${newQuery}`);
    }
  };

  // Update URL search params when category changes
  const handleSelectCategory = (catName) => {
    triggerFilterShimmer();
    setSelectedCategory(catName);
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (catName === 'All Categories') {
        params.delete('category');
      } else {
        const slug = NAME_TO_SLUG[catName] || catName.toLowerCase().replace(/\s+/g, '-');
        params.set('category', slug);
      }
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState({}, '', `/products${newQuery}`);
    }
  };

  // Close sort dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live item counts per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All Categories': mockProducts.length };
    CATEGORY_NAMES.forEach((cat) => {
      if (cat !== 'All Categories') {
        counts[cat] = mockProducts.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, []);

  // Apply Price Filter
  const handleApplyPrice = (e) => {
    e?.preventDefault();
    triggerFilterShimmer();
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
    setCurrentPage(1);
  };

  // Clear Price Filter
  const handleClearPrice = () => {
    triggerFilterShimmer();
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setCurrentPage(1);
  };

  // Reset All Filters
  const handleResetAll = () => {
    triggerFilterShimmer();
    handleSelectCategory('All Categories');
    handleClearSearch();
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setMinRating(0);
    setSortBy('Featured');
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...mockProducts];

    // Category filter
    if (selectedCategory !== 'All Categories') {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query filter (title, category, or description)
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Price range filter
    if (appliedMinPrice !== '') {
      list = list.filter((p) => p.price >= Number(appliedMinPrice));
    }
    if (appliedMaxPrice !== '') {
      list = list.filter((p) => p.price <= Number(appliedMaxPrice));
    }

    // Minimum rating filter
    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Top Rated') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [
    selectedCategory,
    effectiveSearch,
    appliedMinPrice,
    appliedMaxPrice,
    minRating,
    sortBy,
  ]);

  // Reset page when total items change and current page is out of bounds
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Determine active filters for chips
  const hasActiveFilters =
    selectedCategory !== 'All Categories' ||
    appliedMinPrice !== '' ||
    appliedMaxPrice !== '' ||
    minRating > 0 ||
    effectiveSearch !== '';

  const activeFiltersCount =
    (selectedCategory !== 'All Categories' ? 1 : 0) +
    (appliedMinPrice !== '' || appliedMaxPrice !== '' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (effectiveSearch !== '' ? 1 : 0);

  // Reusable Filter Sidebar Content
  const renderFilterSections = () => (
    <>
      {/* Categories */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Categories</h3>
        <ul className={styles.categoryList}>
          {CATEGORY_NAMES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <li key={cat}>
                <button
                  type="button"
                  className={`${styles.categoryBtn} ${
                    isActive ? styles.catActive : ''
                  }`}
                  onClick={() => {
                    handleSelectCategory(cat);
                  }}
                >
                  <span>{cat}</span>
                  <span className={styles.catCount}>
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Range */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Price Range</h3>
        <form onSubmit={handleApplyPrice} className={styles.filterSection}>
          <div className={styles.priceInputs}>
            <div className={styles.priceField}>
              <span className={styles.currencyPrefix}>₹</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                className={styles.priceInput}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                aria-label="Minimum price in INR"
              />
            </div>
            <span className={styles.priceSep}>to</span>
            <div className={styles.priceField}>
              <span className={styles.currencyPrefix}>₹</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                className={styles.priceInput}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                aria-label="Maximum price in INR"
              />
            </div>
          </div>
          <button type="submit" className={styles.applyPriceBtn}>
            Apply
          </button>
        </form>
      </div>

      {/* Minimum Rating */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Minimum Rating</h3>
        <div className={styles.ratingList}>
          {[
            { label: 'All Ratings', val: 0 },
            { label: '4.0★ & above', val: 4.0 },
            { label: '4.5★ & above', val: 4.5 },
          ].map((opt) => (
            <label key={opt.val} className={styles.ratingOption}>
              <input
                type="radio"
                name="ratingFilter"
                checked={minRating === opt.val}
                onChange={() => {
                  triggerFilterShimmer();
                  setMinRating(opt.val);
                  setCurrentPage(1);
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <button
        type="button"
        className={styles.resetBtn}
        onClick={handleResetAll}
      >
        Reset All Filters
      </button>
    </>
  );

  return (
    <div className={styles.page}>
      {toast && <Toast message={toast} />}

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className={styles.crumbSep}>
          <ChevronRight size={13} strokeWidth={2} />
        </span>
        <span className={styles.current}>
          {effectiveSearch
            ? `Search: "${effectiveSearch}"`
            : selectedCategory !== 'All Categories'
            ? selectedCategory
            : 'All Products'}
        </span>
      </nav>

      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            {effectiveSearch
              ? `Results for "${effectiveSearch}"`
              : selectedCategory !== 'All Categories'
              ? selectedCategory
              : 'All Products'}
          </h1>
          <span className={styles.countBadge}>
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'product found' : 'products found'}
          </span>
          {effectiveSearch && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={handleClearSearch}
            >
              Clear Search ×
            </button>
          )}
        </div>

        <div className={styles.controlsArea}>
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            className={styles.filterToggleBtn}
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filter menu"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={styles.filterBadge}>{activeFiltersCount}</span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className={styles.sortWrap} ref={sortRef}>
            <button
              type="button"
              className={styles.sortBtn}
              onClick={() => setSortOpen((o) => !o)}
              aria-expanded={sortOpen}
            >
              <span className={styles.sortLabel}>Sort by:</span>
              <span className={styles.sortVal}>{sortBy}</span>
              <ChevronDown size={14} strokeWidth={2} />
            </button>

            {sortOpen && (
              <div className={styles.sortDropdown}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.sortOption} ${
                      sortBy === opt ? styles.sortActive : ''
                    }`}
                    onClick={() => {
                      triggerFilterShimmer();
                      setSortBy(opt);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className={styles.activeChipsBar}>
          <span className={styles.chipsLabel}>Active Filters:</span>

          {selectedCategory !== 'All Categories' && (
            <div className={styles.chip}>
              <span>Category: {selectedCategory}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => handleSelectCategory('All Categories')}
                aria-label={`Remove category filter ${selectedCategory}`}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {(appliedMinPrice !== '' || appliedMaxPrice !== '') && (
            <div className={styles.chip}>
              <span>
                Price: ₹{appliedMinPrice || '0'} – ₹{appliedMaxPrice || 'Max'}
              </span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={handleClearPrice}
                aria-label="Remove price filter"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {minRating > 0 && (
            <div className={styles.chip}>
              <span>Rating: {minRating}★ & above</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => {
                  triggerFilterShimmer();
                  setMinRating(0);
                  setCurrentPage(1);
                }}
                aria-label="Remove rating filter"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {effectiveSearch && (
            <div className={styles.chip}>
              <span>Search: "{effectiveSearch}"</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={handleClearSearch}
                aria-label="Remove search filter"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={handleResetAll}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className={styles.layout}>
        {/* Left Sticky Desktop Sidebar */}
        <aside className={styles.sidebar} aria-label="Product filters">
          {renderFilterSections()}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <>
            <div
              className={styles.mobileOverlay}
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <div
              className={styles.mobileDrawer}
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
            >
              <div className={styles.mobileDrawerHead}>
                <h3>Filters</h3>
                <button
                  type="button"
                  className={styles.mobileCloseBtn}
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <div className={styles.mobileDrawerBody}>
                {renderFilterSections()}
              </div>

              <div className={styles.mobileDrawerFoot}>
                <button
                  type="button"
                  className={styles.mobileApplyBtn}
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </div>
          </>
        )}

        {/* Right Product Grid */}
        <section className={styles.gridArea} aria-label="Products catalog">
          {filterLoading ? (
            <div className={styles.productGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.skeleton}>
                  <div className={styles.skelImg} />
                  <div className={styles.skelBody}>
                    <div className={styles.skelRow} style={{ width: '40%', height: '12px' }} />
                    <div className={styles.skelRow} style={{ width: '85%', height: '16px' }} />
                    <div className={styles.skelRow} style={{ width: '50%', height: '14px' }} />
                    <div className={styles.skelActions}>
                      <div className={styles.skelBtn} />
                      <div className={styles.skelBtn} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <PackageSearch size={44} strokeWidth={1.5} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No products found</h2>
              <p className={styles.emptyDesc}>
                We couldn't find any products matching your current filters. Try
                adjusting or clearing your criteria to browse available items.
              </p>
              <button
                type="button"
                className={styles.emptyResetBtn}
                onClick={handleResetAll}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={styles.productGrid}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onShowToast={showToast}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination} aria-label="Catalog pagination">
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.pageNum} ${
                          currentPage === p ? styles.pageActive : ''
                        }`}
                        onClick={() => handlePageChange(p)}
                        aria-label={`Page ${p}`}
                        aria-current={currentPage === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
