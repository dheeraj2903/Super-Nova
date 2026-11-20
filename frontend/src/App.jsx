import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import CategoryStrip from './components/CategoryStrip/CategoryStrip';
import ProductGrid from './components/ProductGrid/ProductGrid';
import TrustStrip from './components/TrustStrip/TrustStrip';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import AIBuddyDrawer from './components/AIBuddyDrawer/AIBuddyDrawer';
import AIFloatingTrigger from './components/AIFloatingTrigger/AIFloatingTrigger';
import ProductsPage from './pages/ProductsPage';
import SVGDefs from './components/SVGDefs';
import { GLOBAL_SKELETON_MS } from './constants/ui';
import './styles/global.scss';
import './index.scss';

export default function App() {
  /* ── Global UI state ── */
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), GLOBAL_SKELETON_MS);
    return () => clearTimeout(timer);
  }, []);

  // Lightweight global smooth-scroll inertia controller (damped lerp on desktop wheel events)
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let isRunning = false;
    let rafId = null;

    const isScrollableElement = (target) => {
      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (
          el.getAttribute('role') === 'dialog' ||
          el.getAttribute('aria-modal') === 'true'
        ) {
          return true;
        }
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const updateScroll = () => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetY = Math.max(0, Math.min(maxScroll, targetY));
      const diff = targetY - currentY;

      if (Math.abs(diff) > 0.5) {
        currentY += diff * 0.1;
        window.scrollTo({ top: currentY, behavior: 'instant' });
        rafId = requestAnimationFrame(updateScroll);
      } else {
        currentY = targetY;
        window.scrollTo({ top: currentY, behavior: 'instant' });
        isRunning = false;
        rafId = null;
        document.documentElement.style.scrollBehavior = 'smooth';
      }
    };

    const handleWheel = (e) => {
      if (isScrollableElement(e.target) || e.ctrlKey) {
        targetY = window.scrollY;
        currentY = window.scrollY;
        return;
      }

      e.preventDefault();
      document.documentElement.style.scrollBehavior = 'auto';

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetY = Math.max(0, Math.min(maxScroll, targetY + e.deltaY));

      if (!isRunning) {
        isRunning = true;
        currentY = window.scrollY;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    const handleScrollSync = () => {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScrollSync, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScrollSync);
      if (rafId) cancelAnimationFrame(rafId);
      document.documentElement.style.scrollBehavior = 'smooth';
    };
  }, []);

  // Subtle IntersectionObserver scroll-reveal for below-the-fold sections
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentPath, pageLoading]);

  // Listen to popstate (back/forward navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Client-side link navigation interceptor
  useEffect(() => {
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        anchor.origin === window.location.origin &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.defaultPrevented
      ) {
        const url = new URL(anchor.href);
        e.preventDefault();
        window.history.pushState({}, '', url.pathname + url.search + url.hash);
        setCurrentPath(url.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  /* ── Cart helpers ── */
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  /* ── Category selection from strip ── */
  const handleCategorySelect = useCallback((cat) => {
    setActiveCategory(cat);
    const el = document.getElementById('shop-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <SVGDefs />

      <Navbar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onBuddyClick={() => setBuddyOpen(true)}
      />

      {currentPath.startsWith('/products') ? (
        <main style={{ width: '100%', margin: '0 auto' }}>
          <ProductsPage
            searchQuery={searchQuery}
            onAddToCart={addToCart}
            onBuddyClick={() => setBuddyOpen(true)}
          />
        </main>
      ) : (
        <main style={{ width: '100%', margin: '0 auto', padding: '32px 0 0' }}>
          <Hero loading={pageLoading} onBuddyClick={() => setBuddyOpen(true)} />

          <div className="scroll-reveal">
            <CategoryStrip
              loading={pageLoading}
              activeCategory={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>

          <div className="scroll-reveal">
            <ProductGrid
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onAddToCart={addToCart}
              onBuddyClick={() => setBuddyOpen(true)}
            />
          </div>

          <div className="scroll-reveal">
            <TrustStrip />
          </div>
        </main>
      )}

      <div className="scroll-reveal">
        <Footer />
      </div>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
      />

      <AIBuddyDrawer
        isOpen={buddyOpen}
        onClose={() => setBuddyOpen(false)}
        onAddToCart={addToCart}
      />

      {/* Floating AI-Buddy trigger: hidden when either drawer is open */}
      {!buddyOpen && !cartOpen && (
        <AIFloatingTrigger
          isOpen={buddyOpen}
          isCartOpen={cartOpen}
          onClick={() => setBuddyOpen(true)}
        />
      )}
    </>
  );
}
