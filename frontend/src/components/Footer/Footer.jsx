import styles from './Footer.module.scss';

const LINKS = {
  Shop: ['New Arrivals', 'Apparel & Living', 'Design Objects', 'Curated Deals'],
  'Customer Service': ['Order Tracking', 'Shipping & Returns', '24/7 Support', 'Help & FAQs'],
  About: ['Our Story', 'Craftsmanship', 'Sustainability', 'Press & Editorial'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security Architecture', 'Cookie Settings'],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="/" className={styles.wordmark}>
              SUPERNOVA<span className={styles.dot}>.</span>
            </a>
            <p className={styles.tagline}>
              Quietly confident, refined lifestyle commerce designed for purposeful living and effortless catalog curation.
            </p>
          </div>

          {Object.entries(LINKS).map(([col, items]) => (
            <div key={col} className={styles.col}>
              <h4 className={styles.colHead}>{col}</h4>
              <ul className={styles.colList}>
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className={styles.link}>{item}</a>
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
