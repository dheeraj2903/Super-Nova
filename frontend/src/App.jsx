import { useState, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import CategoryStrip from './components/CategoryStrip/CategoryStrip';
import ProductGrid from './components/ProductGrid/ProductGrid';
import CartDrawer from './components/CartDrawer/CartDrawer';
import AIBuddyDrawer from './components/AIBuddyDrawer/AIBuddyDrawer';
import SVGDefs from './components/SVGDefs';

export default function App() {
  /* ── Global UI state ── */
  const [cartOpen, setCartOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

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
    // scroll to grid
    const el = document.getElementById('shop-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      {/* Inline SVG symbol defs (used by category & hero illustrations) */}
      <SVGDefs />

      <Navbar
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onBuddyClick={() => setBuddyOpen(true)}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 32px 96px' }}>
        <Hero onBuddyClick={() => setBuddyOpen(true)} />

        <CategoryStrip
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        <ProductGrid
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onAddToCart={addToCart}
          onBuddyClick={() => setBuddyOpen(true)}
        />
      </main>

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
    </>
  );
}
