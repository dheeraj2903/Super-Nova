import BrandLogo from '../BrandLogo';
import { navigate } from '../../utils/navigation';
import styles from './Footer.module.scss';

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products' },
    { label: 'Curated Deals', href: '/deals' },
  ],
  'Sell & Account': [
    { label: 'Sell on Supernova', href: '/sell', isHighlighted: true },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'Order Tracking', href: '/orders' },
  ],
  Support: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Help & FAQs', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <BrandLogo />
            <p className={styles.tagline}>
              Quietly confident, refined lifestyle commerce designed for purposeful living and effortless catalog curation.
            </p>
          </div>

          {Object.entries(LINKS).map(([col, items]) => (
            <div key={col} className={styles.col}>
              <h4 className={styles.colHead}>{col}</h4>
              <ul className={styles.colList}>
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`${styles.link} ${item.isHighlighted ? styles.highlightLink : ''}`}
                      onClick={(e) => {
                        if (item.href.startsWith('/')) {
                          e.preventDefault();
                          navigate(item.href);
                        }
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <span>© 2026 SUPERNOVA Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
