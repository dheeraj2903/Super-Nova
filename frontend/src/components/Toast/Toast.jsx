import { useEffect } from 'react';
import { Check } from 'lucide-react';
import styles from './Toast.module.scss';

export default function Toast({ message, product, title, subtext, onClose, onOpenCart }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose, message, product, title]);

  const handleBagClick = (e) => {
    e.preventDefault();
    if (onOpenCart) {
      onOpenCart();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supernova:open-cart'));
    }
    if (onClose) onClose();
  };

  // Determine title and subtext
  let displayTitle = '';
  let displaySubtext = 'Added to your bag';
  let showBagLink = true;

  if (product && product.title) {
    displayTitle = product.title;
  } else if (title) {
    displayTitle = title;
    if (subtext !== undefined) displaySubtext = subtext;
  } else if (typeof message === 'string') {
    if (message.includes('added to cart') || message.includes('added to bag') || message.includes('Added to your bag')) {
      displayTitle = message
        .replace(/…?\s*added to cart/i, '')
        .replace(/…?\s*added to bag/i, '')
        .trim();
      displaySubtext = 'Added to your bag';
    } else {
      displayTitle = message;
      displaySubtext = '';
      showBagLink = false;
    }
  } else if (message && typeof message === 'object') {
    displayTitle = message.title || message.message || '';
    displaySubtext = message.subtext !== undefined ? message.subtext : 'Added to your bag';
    showBagLink = message.showBagLink !== false;
  }

  return (
    <div className={styles.toastCard} role="status" aria-live="polite">
      <div className={styles.checkIconWrap}>
        <Check size={14} strokeWidth={2.6} className={styles.checkIcon} />
      </div>

      <div className={styles.contentWrap}>
        <div className={styles.productTitle} title={displayTitle}>
          {displayTitle}
        </div>
        {displaySubtext && (
          <div className={styles.subtext}>{displaySubtext}</div>
        )}
      </div>

      {showBagLink && (
        <a href="/cart" className={styles.viewBagLink} onClick={handleBagClick}>
          View Bag &rarr;
        </a>
      )}
    </div>
  );
}
