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
import SVGDefs from './components/SVGDefs';
import './styles/global.scss';

export default function App() {
  /* ── Global UI state ── */
  const [pageLoading, setPageLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 550);
    return () => clearTimeout(timer);
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

      <main style={{ width: '100%', margin: '0 auto', padding: '32px 0 0' }}>
        <Hero loading={pageLoading} onBuddyClick={() => setBuddyOpen(true)} />

        <CategoryStrip
          loading={pageLoading}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        <ProductGrid
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onAddToCart={addToCart}
          onBuddyClick={() => setBuddyOpen(true)}
        />

        <TrustStrip />
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
      />

      <AIBuddyDrawer
        isOpen={buddyOpen}
        onClose={() => setBuddyOpen(false)}
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
