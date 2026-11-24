import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, User, Package, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { navigate } from '../utils/navigation';
import Toast from '../components/Toast/Toast';

export default function ProfilePage() {
  const { user, updateUserProfile, loading: authLoading } = useAuth();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [authLoading, user]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  // Sync state whenever user changes or loads
  useEffect(() => {
    if (user) {
      setFirstName(user.fullName?.firstName || '');
      setLastName(user.fullName?.lastName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedUser = {
      ...user,
      fullName: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      username: username.trim(),
      email: email.trim(),
    };

    // Update AuthContext and localStorage immediately
    if (typeof updateUserProfile === 'function') {
      updateUserProfile(updatedUser);
    } else {
      try {
        localStorage.setItem('supernova_auth_user', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    }

    // Optional non-blocking PATCH to backend endpoint http://localhost:3000/api/auth/users/me
    const patchPayload = {
      fullName: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      username: username.trim(),
      email: email.trim(),
      ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
    };

    api.patch('/users/me', patchPayload).catch((err) => {
      // Non-blocking fallback for local mock/demo mode
      console.warn('Backend profile update note:', err?.message || err);
    });

    setNewPassword('');
    setIsSaving(false);
    setShowBanner(true);
    showToast('Profile updated');
    setTimeout(() => {
      setShowBanner(false);
    }, 3500);
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F5',
          padding: '40px 20px',
        }}
      >
        <div style={{ color: '#57534E', fontSize: 14, fontWeight: 600 }}>
          Loading profile...
        </div>
      </div>
    );
  }

  const roleRaw = (user.role || 'customer').toUpperCase();
  const roleDisplay = roleRaw === 'USER' ? 'CUSTOMER' : roleRaw;
  const userInitial = (firstName || username || 'U')[0].toUpperCase();
  const displayName = `${firstName} ${lastName}`.trim() || username || 'User';

  const labelStyle = {
    display: 'block',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#57534E',
    marginBottom: 6,
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid #E7E3DC',
    fontSize: 14,
    color: '#18181B',
    background: '#FAF8F5',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        background: '#FAF8F5',
        padding: '40px 24px 80px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Top Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#57534E',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 24,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#18181B')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#57534E')}
        >
          <ArrowLeft size={15} /> Back to Storefront
        </button>

        {/* Clean Page Heading */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#18181B',
              margin: '0 0 6px',
            }}
          >
            My Profile
          </h1>
          <p style={{ color: '#57534E', fontSize: 14, margin: 0 }}>
            Manage your personal details and account preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E7E3DC',
            borderRadius: 16,
            padding: '32px 36px',
            boxShadow: '0 4px 20px -4px rgba(24, 24, 27, 0.04)',
            marginBottom: 24,
          }}
        >
          {/* Avatar circle with user's initial, role pill, and @username */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              paddingBottom: 24,
              marginBottom: 24,
              borderBottom: '1px solid #F0ECE1',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: '#18181B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
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
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#18181B',
                  }}
                >
                  {displayName}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 9px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    background:
                      roleDisplay === 'SELLER'
                        ? '#18181B'
                        : roleDisplay === 'ADMIN'
                        ? 'rgba(5, 150, 105, 0.12)'
                        : 'rgba(196, 98, 16, 0.1)',
                    color:
                      roleDisplay === 'SELLER'
                        ? '#FFFFFF'
                        : roleDisplay === 'ADMIN'
                        ? '#059669'
                        : '#C46210',
                    border:
                      roleDisplay === 'SELLER'
                        ? 'none'
                        : roleDisplay === 'ADMIN'
                        ? '1px solid rgba(5, 150, 105, 0.25)'
                        : '1px solid rgba(196, 98, 16, 0.25)',
                  }}
                >
                  {roleDisplay}
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#71717A' }}>
                @{user.username || 'username'}
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {showBanner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#065F46',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              <span>Profile updated successfully</span>
            </div>
          )}

          {/* Editable Form */}
          <form onSubmit={handleSave}>
            {/* 1. First Name & Last Name (2-column row) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Elena"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#18181B')}
                  onBlur={(e) => (e.target.style.borderColor = '#E7E3DC')}
                />
              </div>

              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Rostova"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#18181B')}
                  onBlur={(e) => (e.target.style.borderColor = '#E7E3DC')}
                />
              </div>
            </div>

            {/* 2. Username (@handle) */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#A1A1AA',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="handle"
                  required
                  style={{ ...inputStyle, paddingLeft: 30 }}
                  onFocus={(e) => (e.target.style.borderColor = '#18181B')}
                  onBlur={(e) => (e.target.style.borderColor = '#E7E3DC')}
                />
              </div>
            </div>

            {/* 3. Email Address */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#18181B')}
                onBlur={(e) => (e.target.style.borderColor = '#E7E3DC')}
              />
            </div>

            {/* 4. Optional New Password field */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#18181B')}
                onBlur={(e) => (e.target.style.borderColor = '#E7E3DC')}
              />
            </div>

            {/* Primary Save Changes Button */}
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '12px 28px',
                background: '#18181B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                opacity: isSaving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSaving) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!isSaving) e.currentTarget.style.opacity = '1';
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick Links Footer Inside Page */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            background: '#FFFFFF',
            border: '1px solid #E7E3DC',
            borderRadius: 16,
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 13, color: '#71717A', fontWeight: 500 }}>
            Account Quick Links
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => navigate('/addresses')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                color: '#18181B',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C46210')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#18181B')}
            >
              <MapPin size={14} color="#71717A" />
              <span>Saved Addresses &rarr;</span>
            </button>

            <button
              onClick={() => navigate('/orders')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                color: '#18181B',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C46210')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#18181B')}
            >
              <Package size={14} color="#71717A" />
              <span>My Orders &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
