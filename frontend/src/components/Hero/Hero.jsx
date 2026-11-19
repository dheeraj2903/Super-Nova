import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import styles from './Hero.module.scss';

export default function Hero({ onBuddyClick }) {
  const ref = useRevealOnScroll(0.1);

  return (
    <section className={styles.hero} ref={ref}>
      <div className={styles.left}>
        <span className={styles.badge}>• SEASONAL EDIT • UP TO 50% OFF</span>

        <h1 className={styles.headline}>
          Elevate Your Everyday Essentials.
        </h1>

        <p className={styles.subtitle}>
          Curated electronics, footwear, audio, and home goods delivered fast.
        </p>

        <div className={styles.ctas}>
          <a href="#shop-grid" className={styles.ctaSolid}>
            Shop Collection <ArrowRight size={16} strokeWidth={2} />
          </a>
          <button className={styles.ctaOutline} onClick={onBuddyClick}>
            <Sparkles size={15} strokeWidth={2} /> Ask AI-Buddy
          </button>
        </div>

        <div className={styles.trustStrip}>
          <span className={styles.trustItem}>
            <span className={styles.trustDot} />
            480+ ATELIERS ACTIVE
          </span>
          <span className={styles.trustItem}>
            <Zap size={12} strokeWidth={2.5} />
            SAME-DAY DISPATCH IN 14 METROS
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <img
          src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&q=85&auto=format&fit=crop"
          alt="Curated lifestyle essentials – headphones, notebook and watch on stone"
          className={styles.heroImage}
        />
        <div className={styles.glassBadge}>
          <span>• CURATION BATCH NO. 04</span>
          <span className={styles.limitedTag}>Limited Inventory</span>
        </div>
      </div>
    </section>
  );
}
