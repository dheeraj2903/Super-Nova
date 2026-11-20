import { ChevronRight } from 'lucide-react';
import { categories } from '../../data/mockProducts';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import styles from './CategoryStrip.module.scss';

export default function CategoryStrip({ activeCategory, onSelect }) {
  const ref = useRevealOnScroll(0.1);

  return (
    <section className={`${styles.section} container`} ref={ref}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Shop by Category</h2>
          <p className={styles.subtitle}>Curated essentials across everyday tech &amp; lifestyle</p>
        </div>
        <button className={styles.viewAll}>
          View All (6) <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.grid}>
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              className={`${styles.card} ${isActive ? styles.active : ''}`}
              onClick={() => onSelect(cat.name)}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div className={styles.imgWrap}>
                <img src={cat.image} alt={cat.name} className={styles.img} />
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{cat.name}</span>
                <span className={styles.count}>{cat.count} Items</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
