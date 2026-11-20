import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * IntersectionObserver reveal hook.
 * Elements remain 100% visible by default (opacity: 1; transform: none;).
 * When scrolled into view, `is-revealed` is added to trigger a subtle entrance animation.
 */
export function useRevealOnScroll(threshold = 0.08) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px 50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Debounce hook for search input.
 */
export function useDebounce(value, delay = 320) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Persist wishlist IDs in localStorage.
 */
export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('supernova_wishlist') || localStorage.getItem('kartiq_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const toggle = useCallback((id) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('supernova_wishlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  return { wishlist, toggle, isWishlisted };
}
