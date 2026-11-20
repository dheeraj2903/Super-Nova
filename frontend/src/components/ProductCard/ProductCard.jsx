import { Heart, ShoppingCart, Zap } from 'lucide-react';
import { useWishlist } from '../../hooks/useStorefront';
import styles from './ProductCard.module.scss';

export default function ProductCard({ product, onAddToCart, onShowToast }) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product._id);
    onShowToast(wishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist ♡');
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    onShowToast(`${product.title.slice(0, 24)}… added to cart`);
  };

  return (
    <article className={styles.card}>
      {/* Image area */}
      <div className={styles.imgWrap}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.img}
          loading="lazy"
        />

        {/* Discount pill */}
        <span className={styles.discountPill}>{product.discount}% OFF</span>

        {/* Wishlist */}
        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={wishlisted ? '#E11D48' : 'none'}
            stroke={wishlisted ? '#E11D48' : 'currentColor'}
          />
        </button>
      </div>

      {/* Body */}
      <div className={`${styles.body} ${styles.cardBody}`}>
        <div className={styles.meta}>
          <span className={styles.catPill}>{product.category}</span>
          <span className={styles.rating}>
            <span className={styles.star}>★</span>
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <h3 className={styles.title}>{product.title}</h3>

        <div className={styles.pricing}>
          <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
          <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.cartBtn} onClick={handleAddToCart}>
            <ShoppingCart size={13} strokeWidth={2} /> Add to Cart
          </button>
          <button className={styles.buyBtn} onClick={handleAddToCart}>
            <Zap size={13} strokeWidth={2} /> Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
