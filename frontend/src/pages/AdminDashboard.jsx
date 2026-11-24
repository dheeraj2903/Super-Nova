import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  ArrowLeft,
  Search,
  Trash2,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import productApi from '../api/productApi';
import { mockProducts } from '../data/mockProducts';
import Toast from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import styles from './AdminDashboard.module.scss';

// Initial verified merchants
const INITIAL_SELLERS = [
  {
    id: 'sel_1',
    name: 'Supernova Atelier Studio',
    handle: 'supernova_atelier',
    email: 'atelier@supernova.design',
    productsCount: 14,
    ordersCount: 182,
    revenue: 184500,
    status: 'ACTIVE',
  },
  {
    id: 'sel_2',
    name: 'Nordic Sound Labs',
    handle: 'nordic_sound',
    email: 'contact@nordicsound.io',
    productsCount: 8,
    ordersCount: 94,
    revenue: 98200,
    status: 'ACTIVE',
  },
  {
    id: 'sel_3',
    name: 'Verve Chrono Works',
    handle: 'verve_chrono',
    email: 'team@vervechrono.com',
    productsCount: 6,
    ordersCount: 78,
    revenue: 142000,
    status: 'ACTIVE',
  },
  {
    id: 'sel_4',
    name: 'Artisan Brass & Ceramic',
    handle: 'artisan_craft',
    email: 'studio@artisanbrass.in',
    productsCount: 11,
    ordersCount: 112,
    revenue: 116400,
    status: 'ACTIVE',
  },
  {
    id: 'sel_5',
    name: 'Komorebi Paper Goods',
    handle: 'komorebi_kyoto',
    email: 'orders@komorebi.jp',
    productsCount: 5,
    ordersCount: 36,
    revenue: 42800,
    status: 'SUSPENDED',
  },
  {
    id: 'sel_6',
    name: 'Apex Precision Optics',
    handle: 'apex_optics',
    email: 'sales@apexoptics.de',
    productsCount: 9,
    ordersCount: 65,
    revenue: 89300,
    status: 'ACTIVE',
  },
];

// Initial demo orders monitor
const INITIAL_ADMIN_ORDERS = [
  {
    id: 'ord_1',
    orderNumber: 'SN-98421A',
    customer: 'Elena Rostova',
    customerEmail: 'elena@supernova.design',
    items: 'AuraWave ANC Studio Headphones + 1 item',
    total: 5298,
    payment: 'UPI Verified',
    status: 'CONFIRMED',
  },
  {
    id: 'ord_2',
    orderNumber: 'SN-98422B',
    customer: 'Marcus Vance',
    customerEmail: 'marcus.v@atelier.io',
    items: 'Verve Chrono Minimalist Watch',
    total: 7899,
    payment: 'Card Verified',
    status: 'CONFIRMED',
  },
  {
    id: 'ord_3',
    orderNumber: 'SN-98423C',
    customer: 'Ananya Sharma',
    customerEmail: 'ananya.s@studio.in',
    items: 'Lumino Architectural Brass Lamp + 2 items',
    total: 9597,
    payment: 'UPI Verified',
    status: 'SHIPPED',
  },
  {
    id: 'ord_4',
    orderNumber: 'SN-98424D',
    customer: 'Kenji Takahashi',
    customerEmail: 'kenji.t@design.jp',
    items: 'Apex Japanese Ceramic Pour-Over',
    total: 2199,
    payment: 'NetBanking',
    status: 'DELIVERED',
  },
  {
    id: 'ord_5',
    orderNumber: 'SN-98425E',
    customer: 'Claire Dupont',
    customerEmail: 'claire.d@paris.fr',
    items: 'AuraWave ANC Studio Headphones',
    total: 3499,
    payment: 'Card Verified',
    status: 'PROCESSING',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Sellers' | 'Products' | 'Orders'
  const [sellers, setSellers] = useState(INITIAL_SELLERS);
  const [sellerSearch, setSellerSearch] = useState('');
  const [products, setProducts] = useState(mockProducts);
  const [productSearch, setProductSearch] = useState('');
  const [orders] = useState(INITIAL_ADMIN_ORDERS);
  const [toast, setToast] = useState('');
  const [productToDelete, setProductToDelete] = useState(null); // { _id, title } | null

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Fetch live products with zero-fail fallback
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const res = await productApi.get('/');
        if (
          res.data &&
          Array.isArray(res.data.products) &&
          res.data.products.length > 0
        ) {
          if (isMounted) setProducts(res.data.products);
          return;
        }
      } catch {
        // Fallback to mockProducts already set
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter sellers
  const filteredSellers = useMemo(() => {
    const q = sellerSearch.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.handle.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [sellers, sellerSearch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Toggle seller status
  const toggleSellerStatus = (id) => {
    setSellers((prev) =>
      prev.map((seller) => {
        if (seller.id === id) {
          const nextStatus = seller.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast(
            `${seller.name} is now ${nextStatus === 'ACTIVE' ? 'activated' : 'suspended'}`
          );
          return { ...seller, status: nextStatus };
        }
        return seller;
      })
    );
  };

  // Remove product with Classy Minimalist ConfirmModal
  const handleRemoveProduct = (id) => {
    const target = products.find((p) => p._id === id);
    if (target) {
      setProductToDelete(target);
    } else {
      setProductToDelete({ _id: id, title: 'Product' });
    }
  };

  const confirmRemoveProduct = () => {
    if (!productToDelete) return;
    const { _id, title } = productToDelete;
    setProductToDelete(null);
    setProducts((prev) => prev.filter((p) => p._id !== _id));
    showToast(`"${title.slice(0, 20)}…" removed from catalog`);
  };

  const adminName = user?.fullName
    ? `${user.fullName.firstName || ''} ${user.fullName.lastName || ''}`.trim() || user.username
    : user?.username || 'Platform Admin';

  return (
    <div className={styles.dashboardLayout}>
      {/* ── 1. Left Sidebar (230px wide) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          {/* Brand Wordmark + ADMIN Pill */}
          <div
            className={styles.brandLink}
            onClick={() => setActiveTab('Overview')}
            role="button"
            tabIndex={0}
          >
            <span className={styles.brandText}>SUPERNOVA.</span>
            <span className={styles.adminBadge}>ADMIN</span>
          </div>

          {/* 4 Navigation Tabs */}
          <nav className={styles.navMenu} aria-label="Admin Navigation">
            <button
              className={`${styles.navTabBtn} ${activeTab === 'Overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Overview')}
            >
              <span className={styles.tabIconWrap}>
                <LayoutDashboard size={16} strokeWidth={2} />
              </span>
              <span>Overview</span>
            </button>

            <button
              className={`${styles.navTabBtn} ${activeTab === 'Sellers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Sellers')}
            >
              <span className={styles.tabIconWrap}>
                <Store size={16} strokeWidth={2} />
              </span>
              <span>Sellers</span>
            </button>

            <button
              className={`${styles.navTabBtn} ${activeTab === 'Products' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Products')}
            >
              <span className={styles.tabIconWrap}>
                <Package size={16} strokeWidth={2} />
              </span>
              <span>Products</span>
            </button>

            <button
              className={`${styles.navTabBtn} ${activeTab === 'Orders' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('Orders')}
            >
              <span className={styles.tabIconWrap}>
                <ShoppingCart size={16} strokeWidth={2} />
              </span>
              <span>Orders</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar: ← View Storefront link + Admin Profile Card */}
        <div className={styles.sidebarBottom}>
          <button
            onClick={() => navigate('/')}
            className={styles.viewStoreLink}
            title="Return to Supernova Storefront"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
            <span>View Storefront</span>
          </button>

          <div className={styles.adminProfileCard}>
            <div className={styles.adminName}>{adminName}</div>
            <div className={styles.adminEmail}>{user?.email || 'admin@supernova.design'}</div>
            <div className={styles.activeBadge}>
              <span className={styles.greenDot} />
              <span>ACTIVE SESSION</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── 2. Main Content Area ── */}
      <main className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.breadcrumbWrap}>
            <span className={styles.breadcrumbRoot}>SUPERNOVA ADMIN</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbCurrent}>{activeTab.toUpperCase()}</span>
          </div>

          <div className={styles.systemStatus}>
            <span className={styles.greenDot} />
            <span>Platform Operational &bull; 99.98% Uptime</span>
          </div>
        </header>

        {/* Page Body */}
        <div className={styles.pageBody}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Platform Overview</h1>
                  <p className={styles.pageSubtitle}>
                    Real-time operational metrics, merchant activity, and global platform volume.
                  </p>
                </div>
              </div>

              {/* 4 Compact KPI Cards */}
              <div className={styles.kpiGrid}>
                {/* 1. PLATFORM REVENUE */}
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span className={styles.kpiLabel}>Platform Revenue</span>
                    <div className={styles.kpiIconWrap}>
                      <CreditCard size={16} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>₹48,92,400</div>
                  <div className={styles.kpiTrend}>
                    <TrendingUp size={13} /> +14.2% vs last cycle
                  </div>
                </div>

                {/* 2. TOTAL ORDERS */}
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span className={styles.kpiLabel}>Total Orders</span>
                    <div className={styles.kpiIconWrap}>
                      <ShoppingCart size={16} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>1,284</div>
                  <div className={styles.kpiTrend}>
                    <CheckCircle2 size={13} /> 99.2% fulfillment rate
                  </div>
                </div>

                {/* 3. ACTIVE SELLERS */}
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span className={styles.kpiLabel}>Active Sellers</span>
                    <div className={styles.kpiIconWrap}>
                      <Store size={16} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>{sellers.filter((s) => s.status === 'ACTIVE').length} Ateliers</div>
                  <div className={styles.kpiTrend} style={{ color: '#71717A' }}>
                    <ShieldCheck size={13} /> Verified merchant network
                  </div>
                </div>

                {/* 4. LIVE PRODUCTS */}
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span className={styles.kpiLabel}>Live Products</span>
                    <div className={styles.kpiIconWrap}>
                      <Package size={16} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>{products.length} Items</div>
                  <div className={styles.kpiTrend} style={{ color: '#C46210' }}>
                    <Sparkles size={13} /> Across 6 categories
                  </div>
                </div>
              </div>

              {/* Recent Platform Activity Summary */}
              <div className={styles.activityCard}>
                <div className={styles.cardHead}>
                  <span>Recent Platform Activity</span>
                  <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>Live Feed</span>
                </div>

                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        <strong>Atelier Mono</strong> merchant verification approved for live storefront publishing.
                      </div>
                      <div className={styles.activityTime}>2 minutes ago &bull; Merchant Onboarding</div>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        High-value order <strong>#SN-98421A</strong> (₹5,298) confirmed via instant UPI verification.
                      </div>
                      <div className={styles.activityTime}>14 minutes ago &bull; Payment Clearances</div>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        <strong>AuraWave ANC Studio Headphones</strong> restocked (+25 units) by Supernova Atelier.
                      </div>
                      <div className={styles.activityTime}>45 minutes ago &bull; Inventory Sync</div>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        Automated vendor payout of <strong>₹1,84,500</strong> dispatched to verified escrow account.
                      </div>
                      <div className={styles.activityTime}>2 hours ago &bull; Payout Settlement</div>
                    </div>
                  </div>

                  <div className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>
                        Priority express courier manifest generated with carbon-neutral logistics tracking.
                      </div>
                      <div className={styles.activityTime}>3 hours ago &bull; Transit Dispatch</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELLERS (Sellers Management) */}
          {activeTab === 'Sellers' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Sellers Management</h1>
                  <p className={styles.pageSubtitle}>
                    Supervise verified artisan ateliers, track performance, and manage vendor publishing privileges.
                  </p>
                </div>
              </div>

              {/* Search Bar + Count */}
              <div className={styles.tableControls}>
                <div className={styles.searchWrap}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Filter by seller name, handle, or email..."
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.countBadge}>
                  Showing {filteredSellers.length} of {sellers.length} sellers
                </div>
              </div>

              {/* Sellers Table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Seller / Store</th>
                      <th>Email</th>
                      <th>Products</th>
                      <th>Orders</th>
                      <th>Revenue (₹)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSellers.map((seller) => (
                      <tr key={seller.id}>
                        <td>
                          <div className={styles.sellerCell}>
                            <span className={styles.sellerNameText}>{seller.name}</span>
                            <span className={styles.sellerHandle}>@{seller.handle}</span>
                          </div>
                        </td>
                        <td style={{ color: '#57534E' }}>{seller.email}</td>
                        <td style={{ fontWeight: 600 }}>{seller.productsCount}</td>
                        <td style={{ fontWeight: 600 }}>{seller.ordersCount}</td>
                        <td style={{ fontWeight: 700 }}>₹{seller.revenue.toLocaleString('en-IN')}</td>
                        <td>
                          {seller.status === 'ACTIVE' ? (
                            <span className={styles.statusActive}>
                              <span className={styles.statusDotGreen} /> ACTIVE
                            </span>
                          ) : (
                            <span className={styles.statusSuspended}>
                              <span className={styles.statusDotRed} /> SUSPENDED
                            </span>
                          )}
                        </td>
                        <td>
                          {seller.status === 'ACTIVE' ? (
                            <button
                              onClick={() => toggleSellerStatus(seller.id)}
                              className={styles.suspendBtn}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleSellerStatus(seller.id)}
                              className={styles.activateBtn}
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'Products' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Product Catalog Supervision</h1>
                  <p className={styles.pageSubtitle}>
                    Audit platform-wide listings across electronics, audio, apparel, and studio essentials.
                  </p>
                </div>
              </div>

              {/* Search Bar + Count */}
              <div className={styles.tableControls}>
                <div className={styles.searchWrap}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by product title or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.countBadge}>
                  Showing {filteredProducts.length} live products
                </div>
              </div>

              {/* Products Table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price (₹)</th>
                      <th>Rating</th>
                      <th>Status / Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className={styles.productCell}>
                            <img src={p.image} alt={p.title} className={styles.productThumb} />
                            <span className={styles.productTitle} title={p.title}>
                              {p.title}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#F2EFE9',
                              border: '1px solid #E6E1D6',
                              borderRadius: 999,
                              padding: '2px 8px',
                              fontSize: 11.5,
                              color: '#57534E',
                              fontWeight: 600,
                            }}
                          >
                            {p.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ color: '#F59E0B', fontWeight: 700 }}>★</span>{' '}
                          <span style={{ fontWeight: 600 }}>{p.rating}</span>
                        </td>
                        <td>
                          <span style={{ color: '#059669', fontSize: 12.5, fontWeight: 600 }}>
                            ● In Stock (24 units)
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleRemoveProduct(p._id)}
                            className={styles.removeBtn}
                            title="Remove from platform catalog"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'Orders' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Orders Monitor</h1>
                  <p className={styles.pageSubtitle}>
                    Real-time transaction clearing, payment verifications, and delivery fulfillments.
                  </p>
                </div>
              </div>

              {/* Orders Table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total (₹)</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => {
                      const statusClass =
                        ord.status === 'CONFIRMED'
                          ? styles.confirmed
                          : ord.status === 'SHIPPED'
                          ? styles.shipped
                          : ord.status === 'DELIVERED'
                          ? styles.delivered
                          : styles.processing;

                      return (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 800, letterSpacing: '0.02em' }}>
                            #{ord.orderNumber}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{ord.customer}</span>
                              <span style={{ fontSize: 11.5, color: '#71717A' }}>
                                {ord.customerEmail}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: '#57534E', maxWidth: 300 }}>{ord.items}</td>
                          <td style={{ fontWeight: 700 }}>₹{ord.total.toLocaleString('en-IN')}</td>
                          <td>
                            <span
                              style={{
                                background: '#FAF8F5',
                                border: '1px solid #E7E3DC',
                                borderRadius: 999,
                                padding: '3px 9px',
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: '#18181B',
                              }}
                            >
                              {ord.payment}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.orderBadge} ${statusClass}`}>
                              ● {ord.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} />}

      {/* ── Reusable Classy Minimalist ConfirmModal ── */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Delete Product?"
        description={productToDelete ? `Are you sure you want to remove "${productToDelete.title}" from the catalog?` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmRemoveProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
