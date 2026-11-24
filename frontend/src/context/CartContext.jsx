import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';
import { mockProducts } from '../data/mockProducts';
import { navigate } from '../utils/navigation';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState(null);

  const showToast = useCallback((toastData) => {
    setGlobalToast(toastData);
  }, []);

  const hideToast = useCallback(() => {
    setGlobalToast(null);
  }, []);

  // Restore cart from localStorage on init
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('supernova_cart');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist local cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('supernova_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Sync with backend cart service (port 3002) when authenticated user is active
  useEffect(() => {
    let isMounted = true;

    async function syncBackendCart() {
      // Skip backend calls if unauthenticated or offline demo user
      if (!user || user.id?.startsWith('demo-')) return;

      try {
        const res = await cartApi.get('/', { timeout: 3500 });
        const backendItems = res.data?.cart?.items || [];

        if (isMounted && backendItems.length > 0) {
          setCartItems((prevLocal) => {
            const merged = [...prevLocal];

            backendItems.forEach((bItem) => {
              const bId = bItem.productId?.toString();
              const existingIdx = merged.findIndex((m) => m._id?.toString() === bId);

              if (existingIdx >= 0) {
                merged[existingIdx] = {
                  ...merged[existingIdx],
                  qty: bItem.quantity,
                };
              } else {
                // Find matching product in catalog
                const catalogProd = mockProducts.find((p) => p._id?.toString() === bId);
                if (catalogProd) {
                  merged.push({ ...catalogProd, qty: bItem.quantity });
                } else {
                  merged.push({
                    _id: bId,
                    title: `Curated Archive Object #${bId.slice(-4)}`,
                    category: 'Curated',
                    price: 2499,
                    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&q=80&auto=format&fit=crop',
                    qty: bItem.quantity,
                  });
                }
              }
            });

            return merged;
          });
        }
      } catch (err) {
        // Backend service offline or unreachable: silently retain local cart state
      }
    }

    syncBackendCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Add Item to Cart
  const addToCart = useCallback(
    async (product, qty = 1, options = {}) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => i._id === product._id);
        if (existing) {
          return prev.map((i) =>
            i._id === product._id ? { ...i, qty: i.qty + qty } : i
          );
        }
        return [...prev, { ...product, qty }];
      });

      if (!options?.silent) {
        showToast({
          product,
          title: product.title,
          subtext: 'Added to your bag',
        });
      }

      // If online user, sync to backend
      if (user && !user.id?.startsWith('demo-')) {
        try {
          await cartApi.post('/items', {
            productId: product._id,
            qty,
          });
        } catch {
          // Fallback silently
        }
      }
    },
    [user, showToast]
  );

  // Update Item Quantity
  const updateQty = useCallback(
    async (productId, delta) => {
      let targetNewQty = 0;

      setCartItems((prev) => {
        const item = prev.find((i) => i._id === productId);
        if (!item) return prev;
        targetNewQty = item.qty + delta;

        if (targetNewQty <= 0) {
          return prev.filter((i) => i._id !== productId);
        }
        return prev.map((i) =>
          i._id === productId ? { ...i, qty: targetNewQty } : i
        );
      });

      // Sync to backend
      if (user && !user.id?.startsWith('demo-')) {
        try {
          if (targetNewQty <= 0) {
            // Attempt delete or patch 0
            try {
              await cartApi.delete(`/items/${productId}`);
            } catch {
              await cartApi.patch(`/items/${productId}`, { qty: 0 });
            }
          } else {
            await cartApi.patch(`/items/${productId}`, { qty: targetNewQty });
          }
        } catch {
          // Fallback silently
        }
      }
    },
    [user]
  );

  // Remove Item
  const removeFromCart = useCallback(
    async (productId) => {
      setCartItems((prev) => prev.filter((i) => i._id !== productId));

      if (user && !user.id?.startsWith('demo-')) {
        try {
          try {
            await cartApi.delete(`/items/${productId}`);
          } catch {
            await cartApi.patch(`/items/${productId}`, { qty: 0 });
          }
        } catch {
          // Fallback silently
        }
      }
    },
    [user]
  );

  // Clear Cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem('supernova_cart');
    } catch {
      // ignore
    }
  }, []);

  // Quick Buy (Add to Cart + open Drawer or direct checkout)
  const buyNow = useCallback(
    (product, qty = 1) => {
      addToCart(product, qty);
      setCartOpen(true);
    },
    [addToCart]
  );

  // Proceed to Checkout navigation
  const proceedToCheckout = useCallback(() => {
    setCartOpen(false);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.qty || 1), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0),
    [cartItems]
  );

  const value = {
    cartItems,
    setCartItems,
    cartCount,
    subtotal,
    cartOpen,
    setCartOpen,
    globalToast,
    showToast,
    hideToast,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    buyNow,
    proceedToCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
