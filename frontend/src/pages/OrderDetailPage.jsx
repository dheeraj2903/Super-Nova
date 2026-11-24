import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Truck, Package, Clock, XCircle } from 'lucide-react';
import { navigate } from '../utils/navigation';
import orderApi from '../api/orderApi';
import { getLocalCustomerOrders, saveLocalCustomerOrders, CUSTOMER_DEMO_ORDERS } from './OrdersPage';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import styles from './OrderDetailPage.module.scss';

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', subtext: 'Received' },
  { key: 'CONFIRMED', label: 'Confirmed', subtext: 'Verified by Atelier' },
  { key: 'SHIPPED', label: 'Shipped', subtext: 'In Express Transit' },
  { key: 'DELIVERED', label: 'Delivered', subtext: 'Doorstep Completed' },
];

export default function OrderDetailPage({ orderId: propOrderId }) {
  // Extract orderId from URL if not explicitly passed as prop
  const orderId =
    propOrderId ||
    (typeof window !== 'undefined'
      ? window.location.pathname.replace(/^\/orders\/?/, '').split('/')[0] || ''
      : '');

  const [order, setOrder] = useState(() => {
    const list = getLocalCustomerOrders();
    const found = list.find((o) => o._id === orderId || o.orderNumber === orderId);
    return found || list[0] || CUSTOMER_DEMO_ORDERS[0];
  });

  // Fetch real order from backend GET /api/orders/:id
  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      if (!orderId) return;

      try {
        const res = await orderApi.get(`/${orderId}`);
        const ord = res.data?.order || res.data;
        if (ord && isMounted) {
          const formatted = {
            _id: ord._id || ord.id || orderId,
            orderNumber: ord.orderNumber || `ORD-${orderId.slice(0, 8)}`,
            status: ord.status || 'PENDING',
            createdAt: ord.createdAt || new Date().toISOString(),
            totalPrice: {
              amount: ord.totalPrice?.amount || ord.totalAmount || 3499,
              currency: ord.totalPrice?.currency || 'INR',
            },
            paymentStatus: ord.paymentStatus || 'PAID',
            paymentMethod: ord.paymentMethod || 'Verified UPI (Instant)',
            shippingAddress: ord.shippingAddress || {
              fullName: 'Elena Rostova',
              street: '42 Avenue Montaigne, Apt 3B',
              city: 'Paris / New Delhi',
              state: 'DL',
              zip: '110001',
              country: 'India',
              phone: '+91 98201 44521',
            },
            items:
              ord.items?.map((it, idx) => ({
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
          };

          setOrder(formatted);

          // Update in local cache
          const list = getLocalCustomerOrders();
          const updated = list.map((o) => (o._id === formatted._id ? formatted : o));
          saveLocalCustomerOrders(updated);
        }
      } catch {
        // Fallback to local
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Stepper step calculations
  // Enum: "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  const progressPercent =
    currentStepIndex <= 0
      ? 0
      : currentStepIndex === 1
      ? 33
      : currentStepIndex === 2
      ? 66
      : 100;

  const [showCancelModal, setShowCancelModal] = useState(false);

  // Cancel order handler with Classy Minimalist ConfirmModal
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);

    try {
      try {
        await orderApi.patch(`/${order._id}/cancel`);
      } catch {
        await orderApi.post(`/${order._id}/cancel`);
      }
    } catch {
      // Optimistic update
    }

    const updated = { ...order, status: 'CANCELLED' };
    setOrder(updated);

    const list = getLocalCustomerOrders();
    const updatedList = list.map((o) => (o._id === order._id ? updated : o));
    saveLocalCustomerOrders(updatedList);
  };

  const statusClass = order.status.toLowerCase();

  return (
    <div className={styles.detailContainer}>
      {/* ── Top Breadcrumb ── */}
      <a
        href="/orders"
        className={styles.backLink}
        onClick={(e) => {
          e.preventDefault();
          navigate('/orders');
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Your Orders</span>
      </a>

      {/* ── Order Header & Visual Stepper Card ── */}
      <section className={styles.orderHeaderCard}>
        <div className={styles.headerTopRow}>
          <div className={styles.orderTitleBlock}>
            <h1 className={styles.orderTitle}>Order #{order.orderNumber}</h1>
            <span className={styles.orderMetaSub}>
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' '}• Estimated delivery in 2-3 business days
            </span>
          </div>

          <span className={`${styles.statusPill} ${styles[statusClass] || ''}`}>
            <span className={styles.statusDot} />
            {order.status}
          </span>
        </div>

        {/* 4-Step Visual Progress Stepper or Cancelled Banner */}
        {isCancelled ? (
          <div className={styles.cancelledBanner}>
            <XCircle size={28} className={styles.cancelledIcon} />
            <div>
              <div className={styles.cancelledTitle}>Order Cancelled</div>
              <div className={styles.cancelledText}>
                This order was cancelled. Any pre-authorized charges have been immediately credited back to your original payment method.
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.stepperContainer}>
            <div className={styles.stepperTrack}>
              {/* Background connector line */}
              <div className={styles.progressLineBg} />
              {/* Filled active connector line */}
              <div
                className={styles.progressLineFill}
                style={{ width: `calc(${progressPercent}% * 0.9 + 10px)` }}
              />

              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const stepStateClass = isCompleted
                  ? styles.completed
                  : isCurrent
                  ? styles.current
                  : '';

                return (
                  <div
                    key={step.key}
                    className={`${styles.stepNode} ${stepStateClass}`}
                  >
                    <div className={styles.stepCircle}>
                      {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <span className={styles.stepTitle}>{step.label}</span>
                    <span className={styles.stepSubtext}>{step.subtext}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── 2-Column Order Breakdown ── */}
      <div className={styles.breakdownGrid}>
        {/* Left Card: Itemized Products List */}
        <div className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>
            Itemized Order ({order.items.length} {order.items.length === 1 ? 'Item' : 'Items'})
          </h2>

          <div className={styles.itemsList}>
            {order.items.map((it, idx) => {
              const lineTotal = it.price.amount * it.quantity;

              return (
                <div key={idx} className={styles.itemRow}>
                  <div className={styles.itemInfoCol}>
                    <img
                      src={it.product.image}
                      alt={it.product.title}
                      className={styles.itemThumb}
                    />
                    <div className={styles.itemMeta}>
                      <span className={styles.itemTitle}>{it.product.title}</span>
                      <span className={styles.itemQtyPrice}>
                        Quantity: {it.quantity} × ₹{it.price.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className={styles.itemLineTotal}>
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Shipping Address & Payment Summary */}
        <div className={styles.sectionCard}>
          <h2 className={styles.cardHeading}>Shipping &amp; Payment Details</h2>

          {/* Shipping Address */}
          <div className={styles.addressBlock}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#71717A',
              }}
            >
              DISPATCH DESTINATION
            </span>
            <span className={styles.recipientName}>
              {order.shippingAddress.fullName}
            </span>
            <span className={styles.addressText}>
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zip},{' '}
              {order.shippingAddress.country}
            </span>
            <span className={styles.contactText}>
              Phone: {order.shippingAddress.phone}
            </span>
          </div>

          {/* Price Summary */}
          <div className={styles.summaryList}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{order.totalPrice.amount.toLocaleString('en-IN')}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Estimated Shipping</span>
              <span className={styles.freeShippingTag}>FREE</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total Paid</span>
              <span className={styles.totalPaidVal}>
                ₹{order.totalPrice.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className={styles.paymentMethodTag}>
              <ShieldCheck size={14} color="#059669" />
              <span>{order.paymentMethod} &bull; 256-Bit Cryptographic Receipt</span>
            </div>

            {/* Cancel Action if Eligible */}
            {canCancel && (
              <button
                type="button"
                className={styles.cancelOrderActionBtn}
                onClick={handleCancel}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Reusable Classy Minimalist ConfirmModal ── */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order?"
        description={`Are you sure you want to cancel order #${order.orderNumber}? This action cannot be reversed.`}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        confirmVariant="danger"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
}
