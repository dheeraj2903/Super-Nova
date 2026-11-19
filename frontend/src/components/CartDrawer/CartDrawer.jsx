import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import styles from './CartDrawer.module.scss';

export default function CartDrawer({ isOpen, onClose, items, setItems }) {
  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>Your Cart</h2>
            <p className={styles.count}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBag size={40} strokeWidth={1.5} className={styles.emptyIcon} />
              <p>Your cart is empty</p>
              <button className={styles.shopBtn} onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item._id} className={styles.item}>
                  <img src={item.image} alt={item.title} className={styles.itemImg} />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{item.title}</p>
                    <p className={styles.itemCat}>{item.category}</p>
                    <div className={styles.itemBottom}>
                      <span className={styles.itemPrice}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item._id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span className={styles.qtyNum}>{item.qty}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item._id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.foot}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span className={styles.subtotal}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className={styles.shippingNote}>Shipping and taxes calculated at checkout</p>
            <button className={styles.checkoutBtn}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
