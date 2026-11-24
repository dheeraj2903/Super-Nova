import { useState, useEffect, useMemo } from 'react';
import { Package, ArrowRight, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { navigate } from '../utils/navigation';
import orderApi from '../api/orderApi';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import styles from './OrdersPage.module.scss';

export const CUSTOMER_DEMO_ORDERS = [
  {
    _id: 'ord_c101',
    orderNumber: 'ORD-782910',
    status: 'SHIPPED', // "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
    createdAt: '2026-11-20T14:20:00.000Z',
    totalPrice: { amount: 8698, currency: 'INR' },
    paymentStatus: 'PAID',
    paymentMethod: 'UPI Verified (Instant)',
    shippingAddress: {
      fullName: 'Elena Rostova',
      street: '42 Avenue Montaigne, Apt 3B',
      city: 'Paris / New Delhi',
      state: 'DL',
      zip: '110001',
      country: 'India',
      phone: '+91 98201 44521',
    },
    items: [
      {
        product: {
          _id: 'p002',
          title: 'AuraWave ANC Studio Headphones',
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=420&q=70',
        },
        quantity: 1,
        price: { amount: 3499, currency: 'INR' },
      },
      {
        product: {
          _id: 'p004',
          title: 'Lumino Architectural Brass Lamp',
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=420&q=70',
        },
        quantity: 1,
        price: { amount: 5199, currency: 'INR' },
      },
    ],
  },
  {
    _id: 'ord_c102',
    orderNumber: 'ORD-782911',
    status: 'CONFIRMED',
    createdAt: '2026-11-21T09:10:00.000Z',
    totalPrice: { amount: 7899, currency: 'INR' },
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay / Visa Platinum',
    shippingAddress: {
      fullName: 'Elena Rostova',
      street: '42 Avenue Montaigne, Apt 3B',
      city: 'Paris / New Delhi',
      state: 'DL',
      zip: '110001',
      country: 'India',
      phone: '+91 98201 44521',
    },
    items: [
      {
        product: {
          _id: 'p008',
          title: 'Verve Chrono Minimalist Watch',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=420&q=70',
        },
        quantity: 1,
        price: { amount: 7899, currency: 'INR' },
      },
    ],
  },
  {
    _id: 'ord_c103',
    orderNumber: 'ORD-782912',
    status: 'PENDING',
    createdAt: '2026-11-21T21:40:00.000Z',
    totalPrice: { amount: 4299, currency: 'INR' },
    paymentStatus: 'PAID',
    paymentMethod: 'UPI Verified (Instant)',
    shippingAddress: {
      fullName: 'Elena Rostova',
      street: '42 Avenue Montaigne, Apt 3B',
      city: 'Paris / New Delhi',
      state: 'DL',
      zip: '110001',
      country: 'India',
      phone: '+91 98201 44521',
    },
    items: [
      {
        product: {
          _id: 'p003',
          title: 'Saddleback RFID Leather Folio',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=420&q=70',
        },
        quantity: 1,
        price: { amount: 4299, currency: 'INR' },
      },
    ],
  },
  {
    _id: 'ord_c104',
    orderNumber: 'ORD-782913',
    status: 'DELIVERED',
    createdAt: '2026-11-14T11:15:00.000Z',
    totalPrice: { amount: 2499, currency: 'INR' },
    paymentStatus: 'PAID',
    paymentMethod: 'Mastercard Debit',
    shippingAddress: {
      fullName: 'Elena Rostova',
      street: '42 Avenue Montaigne, Apt 3B',
      city: 'Paris / New Delhi',
      state: 'DL',
      zip: '110001',
      country: 'India',
      phone: '+91 98201 44521',
    },
    items: [
      {
        product: {
          _id: 'p001',
          title: 'StrideLite Knit Running Sneakers',
          image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=420&q=70',
        },
        quantity: 1,
        price: { amount: 2499, currency: 'INR' },
      },
    ],
  },
];

export function getLocalCustomerOrders() {
  if (typeof window === 'undefined') return CUSTOMER_DEMO_ORDERS;
  try {
    const raw = localStorage.getItem('supernova_customer_orders');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return CUSTOMER_DEMO_ORDERS;
}

export function saveLocalCustomerOrders(orders) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('supernova_customer_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(() => getLocalCustomerOrders());
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Active' | 'Delivered' | 'Cancelled'
  const [cancelConfirm, setCancelConfirm] = useState(null); // { orderId, orderNumber } | null

  // Fetch from backend GET /api/orders/me
  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderApi.get('/me');
        const list = res.data?.orders || (Array.isArray(res.data) ? res.data : null);

        if (list && list.length > 0 && isMounted) {
          const formatted = list.map((ord, idx) => ({
            _id: ord._id || ord.id || `ord_${idx}`,
            orderNumber: ord.orderNumber || `ORD-${782910 + idx}`,
            status: ord.status || 'PENDING',
            createdAt: ord.createdAt || new Date().toISOString(),
            totalPrice: {
              amount: ord.totalPrice?.amount || ord.totalAmount || 3499,
              currency: ord.totalPrice?.currency || 'INR',
            },
            paymentStatus: ord.paymentStatus || 'PAID',
            paymentMethod: ord.paymentMethod || 'Verified UPI',
            shippingAddress: ord.shippingAddress || {
              fullName: 'Elena Rostova',
              street: '42 Avenue Montaigne',
              city: 'Paris',
              state: 'Île-de-France',
              zip: '75008',
              country: 'France',
              phone: '+91 98201 44521',
            },
            items: ord.items?.map((it) => ({
              product: {
                _id: it.product?._id || it.product || `p_${idx}`,
                title: it.product?.title || it.title || 'Curated Product',
                image:
                  it.product?.image ||
                  it.image ||
                  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=420&q=70',
              },
              quantity: it.quantity || 1,
              price: {
                amount: it.price?.amount || it.price || 1999,
                currency: 'INR',
              },
            })) || [],
          }));

          setOrders(formatted);
          saveLocalCustomerOrders(formatted);
        } else {
          // If no orders returned or backend empty, keep demo fallback
          const local = getLocalCustomerOrders();
          setOrders(local);
        }
      } catch {
        // Fallback gracefully on network error
        const local = getLocalCustomerOrders();
        setOrders(local);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter computation
  const filteredOrders = useMemo(() => {
    if (filterTab === 'Active') {
      return orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPED'
      );
    }
    if (filterTab === 'Delivered') {
      return orders.filter((o) => o.status === 'DELIVERED');
    }
    if (filterTab === 'Cancelled') {
      return orders.filter((o) => o.status === 'CANCELLED');
    }
    return orders;
  }, [orders, filterTab]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPED'
      ).length,
      delivered: orders.filter((o) => o.status === 'DELIVERED').length,
      cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  // Cancel order handler with Classy Minimalist ConfirmModal
  const handleCancelOrder = (orderId, orderNumber) => {
    setCancelConfirm({ orderId, orderNumber });
  };

  const confirmCancelOrder = async () => {
    if (!cancelConfirm) return;
    const { orderId } = cancelConfirm;
    setCancelConfirm(null);

    try {
      try {
        await orderApi.patch(`/${orderId}/cancel`);
      } catch {
        await orderApi.post(`/${orderId}/cancel`);
      }
    } catch {
      // Optimistic update if backend offline
    }

    const updated = orders.map((o) => (o._id === orderId ? { ...o, status: 'CANCELLED' } : o));
    setOrders(updated);
    saveLocalCustomerOrders(updated);
  };

  return (
    <div className={styles.ordersContainer}>
      {/* ── Editorial Header ── */}
      <div className={styles.headerArea}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>Your Orders</h1>
        </div>
        <p className={styles.subtitle}>
          Track active shipments and view past purchases.
        </p>

        {/* Filter Tabs */}
        <div className={styles.filterTabsRow}>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${filterTab === 'All' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('All')}
          >
            All <span className={styles.badgeCount}>{counts.all}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${filterTab === 'Active' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('Active')}
          >
            Active <span className={styles.badgeCount}>{counts.active}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${filterTab === 'Delivered' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('Delivered')}
          >
            Delivered <span className={styles.badgeCount}>{counts.delivered}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${filterTab === 'Cancelled' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('Cancelled')}
          >
            Cancelled <span className={styles.badgeCount}>{counts.cancelled}</span>
          </button>
        </div>
      </div>

      {/* ── Orders List ── */}
      {filteredOrders.length > 0 ? (
        <div className={styles.ordersList}>
          {filteredOrders.map((ord) => {
            const statusClass = ord.status.toLowerCase();
            const itemCount = ord.items.reduce((sum, item) => sum + item.quantity, 0);
            const firstTwoItems = ord.items.slice(0, 2);
            const remainingCount = ord.items.length - 2;
            const canCancel = ord.status === 'PENDING' || ord.status === 'CONFIRMED';

            return (
              <article key={ord._id} className={styles.orderCard}>
                {/* Top Bar */}
                <div className={styles.cardTopBar}>
                  <div className={styles.orderMetaGroup}>
                    <span className={styles.orderId}>#{ord.orderNumber}</span>
                    <span className={styles.orderDate}>
                      Ordered on{' '}
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={`${styles.statusPill} ${styles[statusClass] || ''}`}>
                      <span className={styles.statusDot} />
                      {ord.status}
                    </span>
                  </div>

                  <div className={styles.orderTotalAmount}>
                    ₹{ord.totalPrice.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Middle Row */}
                <div className={styles.cardMiddleRow}>
                  <div className={styles.thumbsContainer}>
                    {firstTwoItems.map((it, idx) => (
                      <div key={idx} className={styles.itemThumbWrap}>
                        <img
                          src={it.product.image}
                          alt={it.product.title}
                          className={styles.itemThumbImg}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>

                  <div className={styles.itemsSummaryText}>
                    <div className={styles.itemTitles}>
                      {firstTwoItems.map((it) => it.product.title).join(' • ')}
                      {remainingCount > 0 && (
                        <span className={styles.moreItemsBadge}>
                          + {remainingCount} more item{remainingCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className={styles.itemSubtext}>
                      {itemCount} total item{itemCount > 1 ? 's' : ''} • {ord.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className={styles.cardBottomActions}>
                  {canCancel && (
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => handleCancelOrder(ord._id, ord.orderNumber)}
                    >
                      Cancel Order
                    </button>
                  )}

                  <a
                    href={`/orders/${ord._id}`}
                    className={styles.trackDetailsBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/orders/${ord._id}`);
                    }}
                  >
                    <span>Track &amp; View Details</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIconWrap}>
            <ShoppingBag size={28} />
          </div>
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptySubtitle}>
            When you purchase handcrafted items and apparel from independent ateliers, your shipments and tracking will appear here.
          </p>
          <a
            href="/products"
            className={styles.exploreCatalogBtn}
            onClick={(e) => {
              e.preventDefault();
              navigate('/products');
            }}
          >
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </a>
        </div>
      )}

      {/* ── Reusable Classy Minimalist ConfirmModal ── */}
      <ConfirmModal
        isOpen={Boolean(cancelConfirm)}
        title="Cancel Order?"
        description={cancelConfirm ? `Are you sure you want to cancel order #${cancelConfirm.orderNumber}? This action cannot be reversed.` : ''}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        confirmVariant="danger"
        onConfirm={confirmCancelOrder}
        onCancel={() => setCancelConfirm(null)}
      />
    </div>
  );
}
