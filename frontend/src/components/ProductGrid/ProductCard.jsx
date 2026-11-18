import { useState, useRef } from 'react';
import './ProductCard.css';

/* Fallback SVG symbols for products without images */
const SYM_MAP = {
  Electronics: '#s-watch',
  Audio:       '#s-head',
  Footwear:    '#s-shoe',
  Bags:        '#s-bag',
  'Home Decor':'#s-lamp',
  Accessories: '#s-wallet',
};

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  const imageUrl = product.images?.[0]?.url ?? null;
  const sym = SYM_MAP[product.category] ?? '#s-bag';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price?.amount;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price.amount / product.originalPrice) * 100)
    : 0;

  function handleAddToCart() {
    onAddToCart(product);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    onAddToCart(product);
  }

  return (
    <article className="product-card">
      {/* Image / illustration */}
      <div className="product-card__image-box">
        {imageUrl ? (
          <img
            className="product-card__img"
            src={imageUrl}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <svg
            className="product-card__svg-fallback"
            width="62%"
            height="62%"
            viewBox="0 0 120 120"
            role="img"
            aria-label={product.title}
          >
            <use href={sym} />
          </svg>
        )}

        <span className="product-card__cat-badge">{product.category}</span>

        {hasDiscount && (
          <span className="product-card__off-badge">{discountPct}% OFF</span>
        )}
      </div>

      {/* Info */}
      <div className="product-card__body">
        <div className="product-card__price-row">
          <span className="product-card__price">{fmt(product.price?.amount ?? 0)}</span>
          {hasDiscount && (
            <span className="product-card__old-price">{fmt(product.originalPrice)}</span>
          )}
        </div>
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__desc">{product.description}</p>
      </div>

      {/* Actions */}
      <div className="product-card__actions">
        <button
          className={`product-card__btn ${added ? 'product-card__btn--added' : 'product-card__btn--add'}`}
          onClick={handleAddToCart}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
        <button className="product-card__btn product-card__btn--buy" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </article>
  );
}
