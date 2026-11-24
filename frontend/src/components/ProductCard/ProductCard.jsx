import { useState } from 'react';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../hooks/useStorefront';
import { navigate } from '../../utils/navigation';
import styles from './ProductCard.module.scss';

export default function ProductCard({ product, onAddToCart, onBuyNow, onShowToast }) {
  const [added, setAdded] = useState(false);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product._id);
    if (onShowToast) {
      onShowToast(wishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist ♡');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  const handleQuickBuy = (e) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onAddToCart(product, 1, { silent: true });
    }
    navigate('/checkout');
  };

  return (
    <article className={styles.card}>
      {/* Compact 175px Image area */}
      <div className={styles.imgWrap}>
        <a href={`/product/${product._id}`} className={styles.imgLink} aria-label={product.title}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.img}
            loading="lazy"
          />
        </a>

        {/* Discount pill */}
        {product.discount > 0 && (
          <span className={styles.discountPill}>{product.discount}% OFF</span>
        )}

        {/* Wishlist */}
        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={14}
            strokeWidth={2}
            fill={wishlisted ? '#E11D48' : 'none'}
            stroke={wishlisted ? '#E11D48' : 'currentColor'}
          />
        </button>
      </div>

      {/* Tightened Body (12px 14px padding) */}
      <div className={`${styles.body} ${styles.cardBody}`}>
        {/* Subtle Category + compact ★ Rating */}
        <div className={styles.meta}>
          <span className={styles.catPill}>{product.category}</span>
          <span className={styles.rating}>
            <span className={styles.star}>★</span>
            {product.rating}
          </span>
        </div>

        {/* Single-line truncated title */}
        <h3 className={styles.title}>
          <a href={`/product/${product._id}`} className={styles.titleLink}>
            {product.title}
          </a>
        </h3>

        {/* Price row paired with compact single-row action bar */}
        <div className={styles.footerRow}>
          <div className={styles.pricing}>
            <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.cartBtn} ${added ? styles.added : ''}`}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              {added ? (
                <>✓ Added</>
              ) : (
                <>
                  <ShoppingCart size={12} strokeWidth={2} />
                  <span>Add</span>
                </>
              )}
            </button>
            <button
              className={styles.quickBuyBtn}
              onClick={handleQuickBuy}
              aria-label="Direct Buy Now"
            >
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
