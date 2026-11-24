import { useState, useMemo } from 'react';
import { ChevronRight, Sparkles, Tag } from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import ProductCard from '../components/ProductCard/ProductCard';
import Toast from '../components/Toast/Toast';
import styles from './Deals.module.scss';

const DEAL_TABS = [
  'All Deals',
  '20%+ Off',
  'Under ₹5,000',
  'Electronics',
  'Audio',
  'Accessories',
];

export default function Deals({ onAddToCart }) {
  const [activeTab, setActiveTab] = useState('All Deals');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const filteredDeals = useMemo(() => {
    // Only items that have a discount
    const withDiscount = mockProducts.filter((p) => p.discount && p.discount > 0);

    switch (activeTab) {
      case '20%+ Off':
        return withDiscount.filter((p) => p.discount >= 20);
      case 'Under ₹5,000':
        return withDiscount.filter((p) => p.price < 5000);
      case 'Electronics':
        return withDiscount.filter((p) => p.category.toLowerCase() === 'electronics');
      case 'Audio':
        return withDiscount.filter((p) => p.category.toLowerCase() === 'audio');
      case 'Accessories':
        return withDiscount.filter((p) => p.category.toLowerCase() === 'accessories');
      case 'All Deals':
      default:
        return withDiscount;
    }
  }, [activeTab]);

  return (
    <div className={styles.dealsPage}>
      {toast && <Toast message={toast} />}

      <div className={styles.inner}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className={styles.crumbSep}>
            <ChevronRight size={13} strokeWidth={2} />
          </span>
          <span className={styles.current}>Deals & Studio Savings</span>
        </nav>

        {/* Compact Editorial Header Bar */}
        <div className={styles.compactHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Deals & Studio Savings</h1>
              <span className={styles.dealsPill}>
                <Tag size={12} strokeWidth={2.5} />
                <span>{filteredDeals.length} Active Discounts</span>
              </span>
            </div>
            <p className={styles.subtitle}>
              Architectural craftsmanship and acoustic precision tools—featured with limited studio discounts.
            </p>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className={styles.filterRow}>
          <div className={styles.tabsList} role="tablist">
            {DEAL_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.tabBtn} ${isActive ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.dealsCount}>
            Showing <strong>{filteredDeals.length}</strong> {filteredDeals.length === 1 ? 'deal' : 'deals'}
          </div>
        </div>

        {/* Product Grid */}
        {filteredDeals.length > 0 ? (
          <div className={styles.grid}>
            {filteredDeals.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
                onShowToast={showToast}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Sparkles size={36} stroke="#C46210" strokeWidth={1.5} />
            <h3>No Deals Found in this Category</h3>
            <p>Check back soon or explore all our active studio promotions.</p>
            <button type="button" onClick={() => setActiveTab('All Deals')}>
              View All Deals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
