import './Hero.css';

function SparkIcon({ size = 16, color = '#7E6140' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  );
}

export default function Hero({ onBuddyClick }) {
  return (
    <section className="hero">
      {/* ── Left column — editorial copy ── */}
      <div className="hero__copy">
        <span className="hero__badge">Autumn / Winter 2026</span>

        <h1 className="hero__heading">
          Elevate Your<br />Everyday Essentials.
        </h1>

        <p className="hero__sub">
          Considered electronics, audio, footwear and home pieces, delivered fast.
        </p>

        <div className="hero__ctas">
          <a className="hero__cta-primary" href="#shop-grid">
            Shop Collection
          </a>
          <button className="hero__cta-secondary" onClick={onBuddyClick}>
            <SparkIcon />
            Not sure? Ask AI-Buddy
          </button>
        </div>
      </div>

      {/* ── Right column — SVG editorial artwork ── */}
      <div className="hero__artwork">
        <div className="hero__canvas">
          {/* Background circle */}
          <div className="hero__circle" />

          {/* Bag illustration */}
          <svg
            className="hero__svg-bag"
            width="240"
            height="240"
            viewBox="0 0 120 120"
            aria-label="Leather backpack"
          >
            <use href="#s-bag" />
          </svg>

          {/* Headphones illustration */}
          <svg
            className="hero__svg-headphones"
            width="190"
            height="190"
            viewBox="0 0 120 120"
            aria-label="Wireless headphones"
          >
            <use href="#s-head" />
          </svg>

          {/* Lamp illustration */}
          <svg
            className="hero__svg-lamp"
            width="170"
            height="170"
            viewBox="0 0 120 120"
            aria-label="Desk lamp"
          >
            <use href="#s-lamp" />
          </svg>

          {/* Price callout */}
          <div className="hero__price-tag">
            <div className="hero__price-tag-label">The Weekender Edit</div>
            <div className="hero__price-tag-value">From ₹1,299</div>
          </div>
        </div>
      </div>
    </section>
  );
}
