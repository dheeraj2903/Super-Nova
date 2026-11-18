import { useEffect } from 'react';
import './CartDrawer.css';

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* ── Individual cart row ── */
function CartItem({ item, onInc, onDec, onRemove }) {
  const imageUrl = item.images?.[0]?.url ?? null;

  return (
    <div className="cart-item">
      {/* Thumbnail */}
      <div className="cart-item__img">
        {imageUrl ? (
          <img src={imageUrl} alt={item.title} />
        ) : (
          <svg width="44" height="44" viewBox="0 0 120 120" aria-hidden="true">
            <use href="#s-bag" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="cart-item__info">
        <div className="cart-item__name">{item.title}</div>
        <div className="cart-item__price">{fmt(item.price?.amount ?? 0)}</div>

        <div className="cart-item__qty">
          <button className="cart-item__qty-btn" onClick={() => onDec(item._id)} aria-label="Decrease qty">−</button>
          <span className="cart-item__qty-num">{item.qty}</span>
          <button className="cart-item__qty-btn" onClick={() => onInc(item._id)} aria-label="Increase qty">+</button>
        </div>

        <button className="cart-item__remove" onClick={() => onRemove(item._id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer({ isOpen, onClose, items, setItems }) {
  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function inc(id) {
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, qty: i.qty + 1 } : i));
  }
  function dec(id) {
    setItems((prev) =>
      prev
        .map((i) => i._id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter((i) => i.qty > 0)
    );
  }
  function remove(id) {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const total = items.reduce((s, i) => s + (i.price?.amount ?? 0) * i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-overlay${isOpen ? ' drawer-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`drawer${isOpen ? ' drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="drawer__header">
          <h2 className="drawer__title">
            Your Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.qty, 0)})`}
          </h2>
          <button className="drawer__close" onClick={onClose} aria-label="Close cart">✕</button>
        </div>

        {/* Body */}
        <div className="drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <div className="cart-empty__text">Your cart is empty</div>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onInc={inc}
                onDec={dec}
                onRemove={remove}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="drawer__footer">
            <div className="cart-summary">
              <span>Total</span>
              <span className="cart-summary__total">{fmt(total)}</span>
            </div>
            <button className="cart-checkout-btn">Proceed to Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}
