import { useState } from 'react';
import { ArrowRight, Sparkles, Package, Truck } from 'lucide-react';
import { navigate } from '../utils/navigation';
import BrandLogo from '../components/BrandLogo';
import styles from './SellerLanding.module.scss';

// Curated Sets of Compressed Photos for the 60fps Diagonal Moving Collage
const COLUMN_1 = [
  {
    title: 'AuraWave ANC Studio Headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Lumino Architectural Brass Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Verve Chrono Minimalist Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'StrideLite Knit Running Sneakers',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=420&q=70',
  },
];

const COLUMN_2 = [
  {
    title: 'Saddleback RFID Leather Folio',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'AeroGrip 75% Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Apex Japanese Ceramic Pour-Over',
    image: 'https://images.unsplash.com/photo-1522675397120-8cb88c83ac16?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Zenith 65W GaN Fast Charger',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=420&q=70',
  },
];

const COLUMN_3 = [
  {
    title: 'Atelier Minimalist Ceramic Vase',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Crafted Pebble Wireless Mouse',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Urban Explorer Canvas Backpack',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Nordic Walnut Desk Stand',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=420&q=70',
  },
];

const COLUMN_4 = [
  {
    title: 'CloudStep Leather Derby Shoes',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Precision Aluminium Stylus Pen',
    image: 'https://images.unsplash.com/photo-1585336261026-778939c43d3b?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Scented Soy Amber Candle',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Matte Black Thermal Tumbler',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=420&q=70',
  },
];

const COLUMN_5 = [
  {
    title: 'Studio Monitor Noise Isolation',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Minimal Optical Frame',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Meridian Hybrid Audio Pods',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=420&q=70',
  },
  {
    title: 'Monochrome Steel Chronometer',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=420&q=70',
  },
];

export default function SellerLanding() {
  const [quickEmail, setQuickEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = quickEmail.trim();
    if (trimmed) {
      navigate(`/signup?role=seller&email=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/signup?role=seller');
    }
  };

  return (
    <div className={styles.sellerLandingPage}>
      {/* ── 1. Top Minimal Sticky Navbar ── */}
      <header className={styles.stickyNav}>
        <div className={styles.navInner}>
          {/* Left: Brand Wordmark + Seller Badge */}
          <div className={styles.brandLink}>
            <BrandLogo href="/" />
            <span className={styles.sellerBadge}>SELLER</span>
          </div>

          {/* Right: Sign in (routes to /login?role=seller) + Start Selling (routes to /signup?role=seller) */}
          <div className={styles.navActions}>
            <a
              href="/login?role=seller"
              className={styles.signInLink}
              onClick={(e) => {
                e.preventDefault();
                navigate('/login?role=seller');
              }}
            >
              Sign in
            </a>
            <button
              type="button"
              className={styles.startStoreBtn}
              onClick={() => navigate('/signup?role=seller')}
            >
              Start Selling
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Full-Viewport Light Hero with Moving Diagonal Product Grid Background ── */}
      <section className={styles.heroSection}>
        {/* GPU-Composited Moving Diagonal Collage */}
        <div className={styles.diagonalCollageWrapper} aria-hidden="true">
          {/* Column 1 - Up */}
          <div className={`${styles.collageColumn} ${styles.colUp}`}>
            {[...COLUMN_1, ...COLUMN_1].map((item, idx) => (
              <div key={`col1-${idx}`} className={styles.collageCard}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImage}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Column 2 - Down */}
          <div className={`${styles.collageColumn} ${styles.colDown}`}>
            {[...COLUMN_2, ...COLUMN_2].map((item, idx) => (
              <div key={`col2-${idx}`} className={styles.collageCard}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImage}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Column 3 - Up */}
          <div className={`${styles.collageColumn} ${styles.colUp}`}>
            {[...COLUMN_3, ...COLUMN_3].map((item, idx) => (
              <div key={`col3-${idx}`} className={styles.collageCard}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImage}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Column 4 - Down */}
          <div className={`${styles.collageColumn} ${styles.colDown}`}>
            {[...COLUMN_4, ...COLUMN_4].map((item, idx) => (
              <div key={`col4-${idx}`} className={styles.collageCard}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImage}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Column 5 - Up */}
          <div className={`${styles.collageColumn} ${styles.colUp}`}>
            {[...COLUMN_5, ...COLUMN_5].map((item, idx) => (
              <div key={`col5-${idx}`} className={styles.collageCard}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImage}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Dark Floating Card */}
        <div className={styles.centerCardContainer}>
          <div className={styles.floatingDarkCard}>
            <h1 className={styles.cardHeadline}>
              Sell your products to buyers across India
            </h1>

            <p className={styles.cardSubtitle}>
              Claim your seller handle and start listing products in minutes.
            </p>

            {/* Email Quick-Start Dark-Glass Pill Bar */}
            <form className={styles.heroPillBar} onSubmit={handleEmailSubmit}>
              <input
                type="email"
                className={styles.heroEmailInput}
                placeholder="Enter your business email..."
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                autoComplete="email"
              />
              <button
                type="submit"
                className={styles.heroArrowBtn}
                aria-label="Start Selling"
              >
                <ArrowRight size={18} strokeWidth={2.4} />
              </button>
            </form>

            <div className={styles.cardFooterNote}>
              <span>Zero listing fees • Instant seller dashboard • Fast payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Section 2: BUILT FOR MODERN SELLERS (Clean 3-Column Feature Grid) ── */}
      <section className={styles.editorialSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeaderWrap}>
            <span className={styles.sectionEyebrow}>BUILT FOR MODERN SELLERS</span>
            <h2 className={styles.sectionTitle}>Everything you need to launch and scale.</h2>
            <p className={styles.sectionSubtitle}>
              A high-performance marketplace platform engineered for creators, brands, and modern merchants.
            </p>
          </div>

          <div className={styles.threeColFeaturesGrid}>
            {/* Feature 1: Catalog & Inventory Control */}
            <article className={styles.featureGridCard}>
              <div className={styles.featureIconWrap}>
                <Package size={22} strokeWidth={2.2} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureGridHeading}>Catalog &amp; Inventory Control</h3>
              <p className={styles.featureGridDesc}>
                Upload high-res product photos, set ₹ pricing, manage stock alerts, and organize categories effortlessly.
              </p>
              <div className={styles.featurePillTag}>
                <span>Instant SKU Management</span>
              </div>
            </article>

            {/* Feature 2: Real-Time Order Fulfillment */}
            <article className={styles.featureGridCard}>
              <div className={styles.featureIconWrap}>
                <Truck size={22} strokeWidth={2.2} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureGridHeading}>Real-Time Order Fulfillment</h3>
              <p className={styles.featureGridDesc}>
                Receive instant customer orders and update statuses (Confirmed &rarr; Shipped &rarr; Delivered) in one click.
              </p>
              <div className={styles.featurePillTag}>
                <span>Live Status Automation</span>
              </div>
            </article>

            {/* Feature 3: AI-Buddy Product Discovery */}
            <article className={styles.featureGridCard}>
              <div className={styles.featureIconWrap}>
                <Sparkles size={22} strokeWidth={2.2} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureGridHeading}>AI-Buddy Product Discovery</h3>
              <p className={styles.featureGridDesc}>
                Your products automatically surface when shoppers ask Supernova&apos;s AI assistant for recommendations.
              </p>
              <div className={styles.featurePillTag}>
                <span>Semantic Smart Surface</span>
              </div>
            </article>
          </div>
        </div>

        {/* ── 4. Section 3: Start Selling in 3 Steps + Bottom CTA ── */}
        <div className={styles.stepsContainer}>
          <div className={styles.stepsHeader}>
            <span className={styles.sectionEyebrow}>HOW IT WORKS</span>
            <h2 className={styles.stepsTitle}>Start Selling in 3 Steps</h2>
            <p className={styles.stepsSubtitle}>
              From registration to your first customer order in under ten minutes.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>01</div>
              <h3 className={styles.stepCardTitle}>Create Seller Account</h3>
              <p className={styles.stepCardDesc}>
                Claim your handle, complete merchant details, and unlock instant role-verified merchant access to your dedicated Studio.
              </p>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>02</div>
              <h3 className={styles.stepCardTitle}>List Your Products</h3>
              <p className={styles.stepCardDesc}>
                Upload high-res product photos, configure transparent ₹ pricing, manage stock quantities, and organize your catalog.
              </p>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>03</div>
              <h3 className={styles.stepCardTitle}>Fulfill &amp; Track Revenue</h3>
              <p className={styles.stepCardDesc}>
                Receive instant order alerts, update delivery milestones with 1-click status transitions, and receive direct Razorpay payouts.
              </p>
            </div>
          </div>

          {/* Clean Bottom Banner: Ready to list your first product? */}
          <div className={styles.ctaBannerContainer}>
            <div className={styles.ctaBanner}>
              <div className={styles.ctaLeft}>
                <span className={styles.ctaEyebrow}>MERCHANT ONBOARDING</span>
                <h3 className={styles.ctaTitle}>Ready to list your first product?</h3>
                <p className={styles.ctaSubtitle}>
                  Join hundreds of vetted merchants selling to shoppers across India with zero listing fees.
                </p>
              </div>
              <div className={styles.ctaRight}>
                <button
                  type="button"
                  className={styles.bannerStartBtn}
                  onClick={() => navigate('/signup?role=seller')}
                >
                  <span>Create Seller Account &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.lightFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>SUPERNOVA.</span>
            <span className={styles.footerCopy}>© 2026 SUPERNOVA Inc. Merchant Platform. All rights reserved.</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="#" onClick={(e) => e.preventDefault()}>Merchant Policies</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Commission Rates</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Seller Support</a>
            <a href="#" onClick={(e) => e.preventDefault()}>API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
