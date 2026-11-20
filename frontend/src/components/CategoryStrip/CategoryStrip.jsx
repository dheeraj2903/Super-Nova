import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { categories } from '../../data/mockProducts';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import { GLOBAL_SKELETON_MS } from '../../constants/ui';
import styles from './CategoryStrip.module.scss';

export default function CategoryStrip({ activeCategory, onSelect, loading: propLoading }) {
  const ref = useRevealOnScroll(0.1);
  const [internalLoading, setInternalLoading] = useState(propLoading !== undefined ? propLoading : true);

  useEffect(() => {
    if (propLoading !== undefined) {
      setInternalLoading(propLoading);
    } else {
      const timer = setTimeout(() => setInternalLoading(false), GLOBAL_SKELETON_MS);
      return () => clearTimeout(timer);
    }
  }, [propLoading]);

  const isLoading = propLoading !== undefined ? propLoading : internalLoading;

  if (isLoading) {
    return (
      <section className={`${styles.section} container`}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Shop by Category</h2>
            <p className={styles.subtitle}>Curated essentials across everyday tech &amp; lifestyle</p>
          </div>
          <a href="/products" className={styles.viewAll}>
            View All (6) <ChevronRight size={15} strokeWidth={2} />
          </a>
        </div>

        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skelCard}>
              <div className={styles.skelImg} />
              <div className={styles.skelInfo}>
                <div className={styles.skelName} />
                <div className={styles.skelCount} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.section} container`} ref={ref}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Shop by Category</h2>
          <p className={styles.subtitle}>Curated essentials across everyday tech &amp; lifestyle</p>
        </div>
        <a href="/products" className={styles.viewAll}>
          View All (6) <ChevronRight size={15} strokeWidth={2} />
        </a>
      </div>

      <div className={styles.grid}>
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.name;
          return (
            <a
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={`${styles.card} ${isActive ? styles.active : ''}`}
              onClick={() => onSelect?.(cat.name)}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className={styles.imgWrap}>
                <img src={cat.image} alt={cat.name} className={styles.img} />
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{cat.name}</span>
                <span className={styles.count}>{cat.count} Items</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
