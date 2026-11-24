import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import { useWishlist } from '../hooks/useStorefront';
import ProductCard from '../components/ProductCard/ProductCard';
import Toast from '../components/Toast/Toast';
import styles from './ProductDetail.module.scss';

const VARIANTS = [
  { name: 'Matte Charcoal', color: '#18181B' },
  { name: 'Raw Titanium', color: '#78716C' },
  { name: 'Warm Sand', color: '#D6CEBE' },
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Raghav M.',
    location: 'Bengaluru',
    date: '2 days ago',
    rating: 5,
    verified: true,
    text: 'The craftsmanship and finish exceeded my expectations. The tactile weight and texture feel remarkably bespoke, matching the studio aesthetic effortlessly.',
  },
  {
    id: 'rev-2',
    author: 'Ananya S.',
    location: 'Mumbai',
    date: '1 week ago',
    rating: 5,
    verified: true,
    text: 'Acoustics and battery longevity are exactly as advertised. Clean spatial separation and zero fatigue over 6 hours of continuous creative work.',
  },
  {
    id: 'rev-3',
    author: 'Devansh K.',
    location: 'New Delhi',
    date: '2 weeks ago',
    rating: 4,
    verified: true,
    text: 'Packaging was pristine and unboxing felt like a luxury design object. Has become my daily essential since day one.',
  },
  {
    id: 'rev-4',
    author: 'Priya R.',
    location: 'Hyderabad',
    date: '3 weeks ago',
    rating: 5,
    verified: true,
    text: 'Impressive structural rigidity. Solid materials, minimalist lines, and immediate reliable operation right out of the box.',
  },
  {
    id: 'rev-5',
    author: 'Vikram N.',
    location: 'Pune',
    date: '1 month ago',
    rating: 4,
    verified: true,
    text: 'Great value for this quality tier. Attention to detail in the bevels and seam joints is very noticeable.',
  },
];

export default function ProductDetail({ productId, onAddToCart, onBuyNow }) {
  // Extract id from props or URL
  const activeId = useMemo(() => {
    if (productId) return productId;
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/product/');
      if (parts[1]) {
        return parts[1].split('?')[0].split('#')[0];
      }
    }
    return 'p001';
  }, [productId]);

  // Find product or fallback to first
  const product = useMemo(() => {
    return mockProducts.find((p) => p._id === activeId) || mockProducts[0];
  }, [activeId]);

  // Gallery images (at least 3 images, with primary fallback)
  const galleryImages = useMemo(() => {
    const list = [product.image];
    if (product.imageHover && product.imageHover !== product.image) {
      list.push(product.imageHover);
    }
    // Add third perspective with cropped/tint parameter
    list.push(`${product.image}&auto=format&fit=crop&w=800&sat=10`);
    return list;
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterRating, setFilterRating] = useState('All');
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS);

  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');

  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const reviewsRef = useRef(null);

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product._id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleWishlistToggle = () => {
    toggle(product._id);
    showToast(wishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist ♡');
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    showToast(`${quantity} × ${product.title.slice(0, 24)}… added to cart`);
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity);
    } else if (onAddToCart) {
      onAddToCart(product, quantity);
    }
    showToast(`Proceeding to checkout with ${quantity} × ${product.title.slice(0, 24)}…`);
  };

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const createdReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      location: 'Verified Buyer',
      date: 'Just now',
      rating: newRating,
      verified: true,
      text: newComment.trim(),
    };

    setReviewsList([createdReview, ...reviewsList]);
    setNewAuthor('');
    setNewComment('');
    setNewRating(5);
    showToast('Thank you! Your verified review has been published.');
  };

  // Filtered reviews in drawer
  const drawerFilteredReviews = useMemo(() => {
    if (filterRating === 'All') return reviewsList;
    const num = parseInt(filterRating, 10);
    return reviewsList.filter((r) => r.rating === num);
  }, [filterRating, reviewsList]);

  const baseReviewCount = product.reviewsCount || product.reviewCount || 120;
  const totalReviewsCount = baseReviewCount + (reviewsList.length - INITIAL_REVIEWS.length);

  // Related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    const sameCategory = mockProducts.filter(
      (p) => p.category === product.category && p._id !== product._id
    );
    if (sameCategory.length >= 4) return sameCategory.slice(0, 4);
    // Fill with remaining products if fewer than 4 in same category
    const others = mockProducts.filter(
      (p) => p.category !== product.category && p._id !== product._id
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product]);

  return (
    <div className={styles.detailPage}>
      {toast && <Toast message={toast} />}

      <div className={styles.inner}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className={styles.crumbSep}>
            <ChevronRight size={13} strokeWidth={2} />
          </span>
          <a href="/products">Products</a>
          <span className={styles.crumbSep}>
            <ChevronRight size={13} strokeWidth={2} />
          </span>
          <a href={`/products?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.category}
          </a>
          <span className={styles.crumbSep}>
            <ChevronRight size={13} strokeWidth={2} />
          </span>
          <span className={styles.current}>{product.title}</span>
        </nav>

        {/* Above-the-Fold 2-Column Showcase */}
        <section className={styles.showcase}>
          {/* Left Gallery */}
          <div className={styles.galleryWrap}>
            <div className={styles.thumbnailStack} role="tablist" aria-label="Product thumbnails">
              {galleryImages.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={activeImageIndex === idx}
                  className={`${styles.thumbBtn} ${
                    activeImageIndex === idx ? styles.thumbActive : ''
                  }`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img
                    src={imgSrc}
                    alt={`${product.title} view ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = product.image;
                    }}
                  />
                </button>
              ))}
            </div>

            <div className={styles.studioStage}>
              <span className={styles.discountBadge}>{product.discount}% OFF</span>
              <img
                src={galleryImages[activeImageIndex] || product.image}
                alt={product.title}
                className={styles.stageImage}
                onError={(e) => {
                  e.target.src = product.image;
                }}
              />
            </div>
          </div>

          {/* Right Purchase Panel */}
          <div className={styles.purchasePanel}>
            <div className={styles.panelTop}>
              <span className={styles.categoryEyebrow}>{product.category}</span>
              <button
                type="button"
                className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlistToggle}
                aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  size={18}
                  strokeWidth={2}
                  fill={wishlisted ? '#E11D48' : 'none'}
                  stroke={wishlisted ? '#E11D48' : 'currentColor'}
                />
              </button>
            </div>

            <h1 className={styles.productTitle}>{product.title}</h1>

            <button
              type="button"
              className={styles.ratingLink}
              onClick={scrollToReviews}
            >
              <span className={styles.ratingStars}>★ {product.rating}</span>
              <span>·</span>
              <span className={styles.reviewCount}>
                {totalReviewsCount} Verified Reviews
              </span>
            </button>

            {/* Price Block */}
            <div className={styles.priceBlock}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className={styles.mrpPrice}>
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className={styles.saveBadge}>
                  SAVE {product.discount}%
                </span>
              </div>
              <p className={styles.taxNotice}>Inclusive of all taxes & studio duties</p>
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Finish / Variant Picker */}
            <div className={styles.variantSection}>
              <div className={styles.sectionLabel}>
                Finish: <span>{selectedVariant}</span>
              </div>
              <div className={styles.variantPills}>
                {VARIANTS.map((v) => {
                  const isSel = selectedVariant === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      className={`${styles.variantBtn} ${isSel ? styles.variantActive : ''}`}
                      onClick={() => setSelectedVariant(v.name)}
                    >
                      <span className={styles.swatch} style={{ background: v.color }} />
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Stock */}
            <div className={styles.stockRow}>
              <div className={styles.stepper} aria-label="Select quantity">
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className={styles.stepValue}>{quantity}</span>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className={styles.stockStatus}>
                <span className={styles.stockDot} />
                <span>In Stock · Ready to Ship</span>
              </div>
            </div>

            {/* Single-line Dual CTAs */}
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} strokeWidth={2.2} />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
              >
                <Zap size={16} strokeWidth={2.2} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* 3-Column Assurance Bar */}
            <div className={styles.assuranceBar}>
              <div className={styles.assuranceItem}>
                <Truck size={18} strokeWidth={2} className={styles.assuranceIcon} />
                <div className={styles.assuranceText}>
                  <strong>Express Courier</strong>
                  <span>2–4 Day Delivery</span>
                </div>
              </div>
              <div className={styles.assuranceItem}>
                <RotateCcw size={18} strokeWidth={2} className={styles.assuranceIcon} />
                <div className={styles.assuranceText}>
                  <strong>7-Day Replacement</strong>
                  <span>Hassle-Free Returns</span>
                </div>
              </div>
              <div className={styles.assuranceItem}>
                <ShieldCheck size={18} strokeWidth={2} className={styles.assuranceIcon} />
                <div className={styles.assuranceText}>
                  <strong>1-Year Warranty</strong>
                  <span>Official Supernova Care</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications & Customer Reviews Section */}
        <section className={styles.detailsSection} ref={reviewsRef}>
          {/* Left Card: Technical Specifications */}
          <div className={styles.specsCard}>
            <h2 className={styles.sectionHeading}>Technical Specifications</h2>
            <div className={styles.specsTable}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Category</span>
                <span className={styles.specVal}>{product.category}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Chassis Finish</span>
                <span className={styles.specVal}>{selectedVariant}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Structural Grade</span>
                <span className={styles.specVal}>Aerospace Aluminum & Matte Polymer</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Connectivity / Interface</span>
                <span className={styles.specVal}>USB-C Fast Sync & Bluetooth 5.3</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Battery / Longevity</span>
                <span className={styles.specVal}>Up to 40 Hours Active Reserve</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Official Warranty</span>
                <span className={styles.specVal}>12 Months Comprehensive Coverage</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Studio Batch</span>
                <span className={styles.specVal}>SN-{product._id.toUpperCase()}-2026</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Origin</span>
                <span className={styles.specVal}>Designed in Studio · Hand-Inspected</span>
              </div>
            </div>
          </div>

          {/* Right Reviews Block */}
          <div className={styles.reviewsBlock}>
            <div className={styles.sectionHeading}>
              <span>Customer Reviews</span>
              <button
                type="button"
                className={styles.writeReviewBtn}
                onClick={() => setDrawerOpen(true)}
              >
                Write a Review
              </button>
            </div>

            {/* Rating Summary */}
            <div className={styles.ratingSummary}>
              <div className={styles.bigScore}>
                <span className={styles.bigNumber}>{product.rating}</span>
                <span className={styles.starsRow}>★★★★★</span>
                <span className={styles.scoreSub}>Based on {totalReviewsCount} reviews</span>
              </div>

              <div className={styles.breakdownBars}>
                <div className={styles.barRow}>
                  <span className={styles.barStar}>5★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '82%' }} />
                  </div>
                  <span className={styles.barPct}>82%</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barStar}>4★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '13%' }} />
                  </div>
                  <span className={styles.barPct}>13%</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barStar}>3★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '4%' }} />
                  </div>
                  <span className={styles.barPct}>4%</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barStar}>2★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '1%' }} />
                  </div>
                  <span className={styles.barPct}>1%</span>
                </div>
              </div>
            </div>

            {/* Top 3 Verified Review Cards */}
            <div className={styles.reviewCardsList}>
              {reviewsList.slice(0, 3).map((rev) => (
                <div key={rev.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <strong>{rev.author}</strong>
                      {rev.verified && (
                        <span className={styles.verifiedBadge}>
                          <CheckCircle2 size={11} strokeWidth={2.5} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className={styles.reviewDate}>
                      {rev.location} · {rev.date}
                    </span>
                  </div>
                  <div className={styles.reviewStars}>
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className={styles.reviewText}>{rev.text}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.viewAllReviewsLink}
              onClick={() => setDrawerOpen(true)}
            >
              View All {totalReviewsCount} Reviews →
            </button>
          </div>
        </section>

        {/* Related Products: You May Also Like */}
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct._id}
                product={relProduct}
                onAddToCart={onAddToCart}
                onShowToast={showToast}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Slide-over All Reviews Drawer */}
      {drawerOpen && (
        <>
          <div
            className={styles.drawerOverlay}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.reviewsDrawer} role="dialog" aria-modal="true" aria-label="Customer reviews">
            <div className={styles.drawerHeader}>
              <h3>Reviews ({totalReviewsCount})</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close reviews drawer"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Star Rating Filter Pills */}
              <div className={styles.drawerFilterPills}>
                {['All', '5★', '4★', '3★'].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className={`${styles.drawerFilterBtn} ${
                      filterRating === pill ? styles.active : ''
                    }`}
                    onClick={() => setFilterRating(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Interactive Write a Review Form */}
              <form onSubmit={handleSubmitReview} className={styles.writeReviewForm}>
                <h4>Share Your Experience</h4>
                <div className={styles.starRatingPicker}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setNewRating(starVal)}
                      className={starVal <= newRating ? styles.starSelected : ''}
                      aria-label={`${starVal} star rating`}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', color: '#71717A', marginLeft: '6px' }}>
                    {newRating} / 5 Stars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Kabir V.)"
                  className={styles.formInput}
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Write your honest studio review..."
                  className={styles.formTextarea}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={styles.submitReviewBtn}
                  disabled={!newAuthor.trim() || !newComment.trim()}
                >
                  Submit Verified Review
                </button>
              </form>

              {/* Reviews List */}
              <div className={styles.reviewCardsList}>
                {drawerFilteredReviews.map((rev) => (
                  <div key={rev.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <strong>{rev.author}</strong>
                        {rev.verified && (
                          <span className={styles.verifiedBadge}>
                            <CheckCircle2 size={11} strokeWidth={2.5} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className={styles.reviewDate}>
                        {rev.location} · {rev.date}
                      </span>
                    </div>
                    <div className={styles.reviewStars}>
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className={styles.reviewText}>{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
