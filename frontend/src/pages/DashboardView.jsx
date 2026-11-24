import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useStorefront';
import { mockProducts } from '../data/mockProducts';
import Toast from '../components/Toast/Toast';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { navigate } from '../utils/navigation';

export default function DashboardView({ type = 'seller' }) {
  const { user, logout, updateUserAddresses } = useAuth();
  const { addToCart, setCartOpen } = useCart();
  const { wishlist, toggle } = useWishlist();

  const [toast, setToast] = useState('');
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  const isSeller = type === 'seller';
  const isAdmin = type === 'admin';
  const isOrders = type === 'orders';
  const isAddresses = type === 'addresses';
  const isWishlist = type === 'wishlist';

  const isSuccess =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('success') === 'true';
  const orderIdParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('orderId') ||
        (window.location.pathname.split('/orders/')[1] || '').split('?')[0] ||
        'SN-98421A'
      : 'SN-98421A';

  const title = isSeller
    ? 'Seller Atelier Studio'
    : isAdmin
    ? 'Platform Administration'
    : isOrders
    ? isSuccess
      ? 'Acquisition Confirmed'
      : 'My Orders & Deliveries'
    : isAddresses
    ? 'Saved Delivery Addresses'
    : 'Curated Wishlist';

  const subtitle = isSeller
    ? 'Active vendor session • Manage artisan inventory, review orders, and monitor catalog status.'
    : isAdmin
    ? 'Master administrative cockpit • Supervise merchants, system audits, and global listings.'
    : isOrders
    ? 'Track ongoing deliveries and review purchase histories.'
    : isAddresses
    ? 'Manage verified primary and secondary shipping locations for rapid checkout.'
    : 'Your preserved archive of exceptional objects, apparel, and studio equipment.';

  /* ─────────────────────────────────────────────────────────────
     ADDRESSES STATE & HANDLERS (persisted + auth state synced)
  ───────────────────────────────────────────────────────────── */
  const [addresses, setAddresses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('supernova_saved_addresses');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    if (user?.addresses && Array.isArray(user.addresses) && user.addresses.length > 0) {
      return user.addresses;
    }
    return [
      {
        _id: 'addr-default-1',
        fullName: user?.fullName
          ? `${user.fullName.firstName} ${user.fullName.lastName}`
          : 'Elena Rostova',
        street: '42 Avenue Montaigne',
        city: 'Paris',
        state: 'Île-de-France',
        zip: '75008',
        country: 'France',
        isDefault: true,
      },
    ];
  });

  const saveAndSyncAddresses = (newAddrs) => {
    setAddresses(newAddrs);
    try {
      localStorage.setItem('supernova_saved_addresses', JSON.stringify(newAddrs));
    } catch {
      // ignore
    }
    if (typeof updateUserAddresses === 'function') {
      updateUserAddresses(newAddrs);
    }
  };

  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrCountry, setAddrCountry] = useState('France');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrError, setAddrError] = useState('');

  const handleAddAddress = (e) => {
    e.preventDefault();
    setAddrError('');
    if (!addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrZip.trim()) {
      setAddrError('Please fill in street, city, state, and postal code.');
      return;
    }

    const newAddr = {
      _id: 'addr_' + Date.now(),
      fullName:
        addrFullName.trim() ||
        (user?.fullName
          ? `${user.fullName.firstName} ${user.fullName.lastName}`
          : 'Recipient'),
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      zip: addrZip.trim(),
      country: addrCountry.trim() || 'France',
      isDefault: addrIsDefault || addresses.length === 0,
    };

    let updated;
    if (newAddr.isDefault) {
      updated = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))];
    } else {
      updated = [...addresses, newAddr];
    }

    saveAndSyncAddresses(updated);
    setIsAddingAddr(false);
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
    setAddrFullName('');
    setAddrIsDefault(false);
    showToast('Delivery address saved successfully');
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a._id === id,
    }));
    saveAndSyncAddresses(updated);
    showToast('Primary delivery address updated');
  };

  const handleDeleteAddress = (id) => {
    setDeleteAddressId(id);
  };

  const confirmDeleteAddress = () => {
    if (!deleteAddressId) return;
    const id = deleteAddressId;
    setDeleteAddressId(null);
    const toDelete = addresses.find((a) => a._id === id);
    let updated = addresses.filter((a) => a._id !== id);
    if (toDelete?.isDefault && updated.length > 0) {
      updated[0] = { ...updated[0], isDefault: true };
    }
    saveAndSyncAddresses(updated);
    showToast('Delivery address removed');
  };

  /* ─────────────────────────────────────────────────────────────
     WISHLIST STATE & HANDLERS
  ───────────────────────────────────────────────────────────── */
  const wishlistedProducts = useMemo(() => {
    return wishlist
      .map((id) => mockProducts.find((p) => p._id === id))
      .filter(Boolean);
  }, [wishlist]);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    toggle(product._id);
    setCartOpen(true);
    showToast(`${product.title.slice(0, 24)}… moved to cart`);
  };

  const handleRemoveFromWishlist = (product) => {
    toggle(product._id);
    showToast(`${product.title.slice(0, 24)}… removed from wishlist`);
  };

  const handleAddSampleWishlist = () => {
    ['p001', 'p002', 'p004'].forEach((id) => {
      if (!wishlist.includes(id)) {
        toggle(id);
      }
    });
    showToast('Curated archive samples added to wishlist');
  };

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '48px 32px 80px',
        minHeight: '70vh',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: '#57534E',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} /> Back to Storefront
      </button>

      {/* Header Banner - Only for Seller/Admin dashboard views */}
      {!isAddresses && !isWishlist && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E6E1D6',
            borderRadius: 20,
            padding: '36px 40px',
            boxShadow: '0 4px 20px -4px rgba(24, 24, 27, 0.05)',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: isSeller
                    ? '#18181B'
                    : isAdmin
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(196, 98, 16, 0.1)',
                  color: isSeller ? '#FFFFFF' : isAdmin ? '#059669' : '#C46210',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                {isSeller
                  ? '● SELLER ATELIER'
                  : isAdmin
                  ? '● ADMIN CONSOLE'
                  : '● CUSTOMER PORTAL'}
              </div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 8px',
                }}
              >
                {title}
              </h1>
              <p style={{ color: '#57534E', fontSize: 14, margin: 0, maxWidth: 620 }}>
                {subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  textAlign: 'right',
                  padding: '8px 16px',
                  background: '#FAF8F5',
                  border: '1px solid #E6E1D6',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 12, color: '#71717A' }}>Active Operator</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>
                  {user?.fullName
                    ? `${user.fullName.firstName} ${user.fullName.lastName}`
                    : user?.username || 'Guest'}
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  padding: '10px 18px',
                  background: '#18181B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Celebration Card */}
      {isOrders && isSuccess && (
        <div
          style={{
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 16,
            padding: '24px 28px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 18,
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)',
          }}
        >
          <CheckCircle2 size={28} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#065F46',
                }}
              >
                Payment Successfully Verified &bull; Order Initiated
              </span>
              <span
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                #{orderIdParam}
              </span>
            </div>
            <p style={{ color: '#047857', fontSize: 13.5, margin: '0 0 10px', lineHeight: 1.5 }}>
              Your acquisition has been confirmed with 256-bit cryptographic verification. Our
              curatorial logistics team is preparing your package for carbon-neutral express transit.
            </p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: '#065F46', fontWeight: 600 }}>
              <span>Courier: Supernova Secured Priority</span>
              <span>&bull;</span>
              <span>Estimated Delivery: 2-3 Business Days</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SAVED ADDRESSES SECTION
      ───────────────────────────────────────────────────────────── */}
      {isAddresses ? (
        <div>
          {/* Clean, Lightweight Editorial Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 32,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 6px',
                }}
              >
                Saved Addresses
              </h1>
              <p style={{ fontSize: 14, color: '#57534E', margin: 0 }}>
                Manage your shipping addresses for faster checkout.
              </p>
            </div>

            <button
              onClick={() => {
                setIsAddingAddr((prev) => !prev);
                setAddrError('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#18181B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {isAddingAddr ? 'Cancel' : <><Plus size={15} /> + Add New Address</>}
            </button>
          </div>

          {/* Add Address Form Accordion */}
          {isAddingAddr && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E6E1D6',
                borderRadius: 20,
                padding: '28px 32px',
                marginBottom: 32,
                boxShadow: '0 8px 30px rgba(24, 24, 27, 0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 16px',
                }}
              >
                Add New Delivery Location
              </h3>

              {addrError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{addrError}</span>
                </div>
              )}

              <form onSubmit={handleAddAddress}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova"
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      Street Address *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 42 Avenue Montaigne"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paris"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      State / Province *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Île-de-France"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 75008"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#57534E',
                        marginBottom: 6,
                        textTransform: 'uppercase',
                      }}
                    >
                      Country
                    </label>
                    <select
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid #E6E1D6',
                        fontSize: 13.5,
                        background: '#FAF8F5',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    >
                      <option value="France">France</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                      <option value="Italy">Italy</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    id="setAsDefault"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    style={{ accentColor: '#C46210', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="setAsDefault" style={{ fontSize: 13, color: '#18181B', cursor: 'pointer' }}>
                    Set as primary default shipping address
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    style={{
                      padding: '11px 24px',
                      background: '#18181B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddr(false)}
                    style={{
                      padding: '11px 20px',
                      background: '#FAF8F5',
                      border: '1px solid #E6E1D6',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#57534E',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address Cards Grid */}
          {addresses.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E6E1D6',
                borderRadius: 20,
                padding: '48px 32px',
                textAlign: 'center',
              }}
            >
              <MapPin size={36} color="#A1A1AA" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: '0 0 6px' }}>
                No saved delivery addresses
              </h3>
              <p style={{ fontSize: 13.5, color: '#57534E', margin: '0 0 20px' }}>
                Add your verified shipping destination to expedite express dispatch.
              </p>
              <button
                onClick={() => setIsAddingAddr(true)}
                style={{
                  padding: '10px 22px',
                  background: '#18181B',
                  color: '#FFFFFF',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Address
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    background: '#FFFFFF',
                    border: addr.isDefault ? '2px solid #C46210' : '1px solid #E6E1D6',
                    borderRadius: 18,
                    padding: '24px 26px',
                    boxShadow: addr.isDefault
                      ? '0 6px 20px rgba(196, 98, 16, 0.08)'
                      : '0 2px 8px rgba(24, 24, 27, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={18} color={addr.isDefault ? '#C46210' : '#71717A'} />
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }}>
                          {addr.fullName || 'Primary Residence'}
                        </span>
                      </div>

                      {addr.isDefault && (
                        <span
                          style={{
                            background: 'rgba(196, 98, 16, 0.1)',
                            border: '1px solid rgba(196, 98, 16, 0.28)',
                            color: '#C46210',
                            borderRadius: 9999,
                            padding: '3px 9px',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          ● Default
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 13.5, color: '#57534E', lineHeight: 1.6, marginBottom: 20 }}>
                      <div>{addr.street}</div>
                      <div>
                        {addr.city}, {addr.state} {addr.zip || addr.pincode}
                      </div>
                      <div style={{ fontWeight: 600, color: '#18181B', marginTop: 2 }}>
                        {addr.country || 'France'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderTop: '1px solid #F2EFE9',
                      paddingTop: 14,
                    }}
                  >
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr._id)}
                        style={{
                          background: '#FAF8F5',
                          border: '1px solid #E6E1D6',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#18181B',
                          padding: '6px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Active Shipping Target
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: '#A1A1AA',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease',
                      }}
                      title="Remove address"
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E11D48')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isWishlist ? (
        /* ─────────────────────────────────────────────────────────────
           2. WISHLIST SECTION
        ───────────────────────────────────────────────────────────── */
        <div>
          {/* Clean, Natural Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 32,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#18181B',
                  margin: '0 0 6px',
                }}
              >
                My Wishlist
              </h1>
              <p style={{ fontSize: 14, color: '#57534E', margin: 0 }}>
                Items you've saved for later ({wishlistedProducts.length} item{wishlistedProducts.length === 1 ? '' : 's'})
              </p>
            </div>

            <button
              onClick={() => navigate('/products')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid #18181B',
                color: '#18181B',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#18181B';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#18181B';
              }}
            >
              Browse Products &rarr;
            </button>
          </div>

          {/* Wishlist Product Grid */}
          {wishlistedProducts.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E6E1D6',
                borderRadius: 20,
                padding: '64px 32px',
                textAlign: 'center',
              }}
            >
              <Heart size={40} color="#A1A1AA" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: '0 0 8px' }}>
                Your wishlist is empty
              </h3>
              <p style={{ fontSize: 14, color: '#57534E', margin: '0 auto 24px', maxWidth: 440, lineHeight: 1.5 }}>
                Explore our catalog and save items you'd like to purchase later.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    padding: '11px 22px',
                    background: '#18181B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {wishlistedProducts.map((prod) => (
                <div
                  key={prod._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E1D6',
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 16px rgba(24, 24, 27, 0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Image container */}
                  <div style={{ position: 'relative', width: '100%', height: 210, background: '#F4F1EA', overflow: 'hidden' }}>
                    <img
                      src={prod.image}
                      alt={prod.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/product/${prod._id}`)}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: '#18181B',
                        color: '#FFFFFF',
                        borderRadius: 9999,
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {prod.discount}% OFF
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(255, 255, 255, 0.94)',
                        color: '#18181B',
                        borderRadius: 9999,
                        padding: '3px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      {prod.category}
                    </span>
                  </div>

                  {/* Body details */}
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F59E0B', fontWeight: 700, marginBottom: 6 }}>
                      <span>★</span>
                      <span style={{ color: '#18181B' }}>{prod.rating}</span>
                      <span style={{ color: '#71717A', fontWeight: 500 }}>({prod.reviewCount})</span>
                    </div>

                    <h4
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#18181B',
                        margin: '0 0 12px',
                        lineHeight: 1.35,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/product/${prod._id}`)}
                    >
                      {prod.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', marginBottom: 18 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#18181B' }}>
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: 13, color: '#A1A1AA', textDecoration: 'line-through' }}>
                        ₹{prod.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Action buttons: Move to Cart & Remove */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleMoveToCart(prod)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 14px',
                          background: '#18181B',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 9999,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <ShoppingBag size={14} /> Move to Cart
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(prod)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 14px',
                          background: '#FAF8F5',
                          border: '1px solid #E6E1D6',
                          color: '#71717A',
                          borderRadius: 9999,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           3. DEFAULT METRICS ROW (Retained for Seller Atelier & Admin)
        ───────────────────────────────────────────────────────────── */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E6E1D6',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#71717A',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                {isSeller ? 'Live Products' : isAdmin ? 'Total Merchants' : 'Active Orders'}
              </span>
              <Package size={18} color="#C46210" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#18181B' }}>
              {isSeller ? '14 Items' : isAdmin ? '48 Ateliers' : '2 Pending'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#059669',
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCircle2 size={13} /> Active &amp; Synced
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E6E1D6',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#71717A',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                {isSeller ? '30-Day Revenue' : isAdmin ? 'Monthly Volume' : 'Saved Addresses'}
              </span>
              <ShoppingCart size={18} color="#C46210" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#18181B' }}>
              {isSeller ? '₹1,84,500' : isAdmin ? '₹42,80,000' : user?.addresses?.length || '1 Saved'}
            </div>
            <div style={{ fontSize: 12, color: '#71717A', marginTop: 6 }}>
              {isSeller
                ? '+18.4% vs last cycle'
                : isAdmin
                ? '99.98% uptime'
                : 'Paris, France (Default)'}
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E6E1D6',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#71717A',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                Session Security
              </span>
              <ShieldCheck size={18} color="#059669" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#18181B' }}>Verified</div>
            <div style={{ fontSize: 12, color: '#71717A', marginTop: 6 }}>
              256-Bit Encrypted &bull; Role Verified
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}

      {/* ── Reusable Classy Minimalist ConfirmModal ── */}
      <ConfirmModal
        isOpen={Boolean(deleteAddressId)}
        title="Delete Saved Address?"
        description="Are you sure you want to remove this delivery address from your profile?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeleteAddress}
        onCancel={() => setDeleteAddressId(null)}
      />
    </div>
  );
}
