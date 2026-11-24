import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { navigate } from '../utils/navigation';

export const DEMO_ACCOUNTS = {
  user: {
    id: 'demo-user-001',
    username: 'elena_rostova',
    email: 'elena.rostova@supernova.design',
    fullName: { firstName: 'Elena', lastName: 'Rostova' },
    role: 'user',
    addresses: [
      {
        _id: 'addr-1',
        street: '42 Avenue Montaigne',
        city: 'Paris',
        state: 'Île-de-France',
        zip: '75008',
        country: 'France',
        isDefault: true,
      },
    ],
  },
  seller: {
    id: 'demo-seller-001',
    username: 'supernova_atelier',
    email: 'atelier@supernova.design',
    fullName: { firstName: 'Supernova', lastName: 'Atelier Studio' },
    role: 'seller',
    addresses: [
      {
        _id: 'addr-2',
        street: '18 Savile Row',
        city: 'London',
        state: 'Greater London',
        zip: 'W1S 3PW',
        country: 'United Kingdom',
        isDefault: true,
      },
    ],
  },
  admin: {
    id: 'demo-admin-001',
    username: 'platform_admin',
    email: 'admin@supernova.design',
    fullName: { firstName: 'Platform', lastName: 'Admin' },
    role: 'admin',
    addresses: [],
  },
};

const AuthContext = createContext(null);

export function getRedirectPath(role) {
  if (role === 'seller') return '/seller/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      return redirect;
    }
  }
  return '/';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('supernova_auth_user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Restore active user session on app mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      let cached = null;
      try {
        const stored = localStorage.getItem('supernova_auth_user');
        if (stored) {
          cached = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      try {
        const res = await api.get('/me', { timeout: 3500 });
        if (res.data?.user && isMounted) {
          setUser(res.data.user);
          localStorage.setItem('supernova_auth_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Fail silently if unauthenticated (401 or network error)
        if (err.response?.status === 401) {
          // If server explicitly says 401 and not a demo user, clear
          if (!cached?.id?.startsWith('demo-')) {
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('supernova_auth_user');
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const register = useCallback(async ({ firstName, lastName, username, email, password, role = 'user' }) => {
    const payload = {
      username,
      email,
      password,
      fullName: { firstName, lastName },
      role,
    };

    try {
      const res = await api.post('/register', payload);
      const registeredUser = res.data?.user || {
        id: 'usr_' + Date.now(),
        username,
        email,
        fullName: { firstName, lastName },
        role,
        addresses: [],
      };
      setUser(registeredUser);
      localStorage.setItem('supernova_auth_user', JSON.stringify(registeredUser));
      const target = getRedirectPath(registeredUser.role);
      navigate(target);
      return { success: true, user: registeredUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier, password }
      : { username: identifier, password };

    try {
      const res = await api.post('/login', payload);
      const loggedInUser = res.data?.user;
      if (!loggedInUser) throw new Error('No user data returned');
      setUser(loggedInUser);
      localStorage.setItem('supernova_auth_user', JSON.stringify(loggedInUser));
      const target = getRedirectPath(loggedInUser.role);
      navigate(target);
      return { success: true, user: loggedInUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    // Instant 0ms Sign Out (Optimistic Logout):
    // Clear user and token immediately from React state and localStorage, navigate to '/' right away.
    setUser(null);
    try {
      localStorage.removeItem('supernova_auth_user');
      localStorage.removeItem('token');
      localStorage.removeItem('supernova_token');
    } catch {
      // ignore
    }
    navigate('/');

    // Fire backend GET http://localhost:3000/api/auth/logout request asynchronously in background without blocking UI
    api.get('/logout').catch(() => {
      // ignore
    });
  }, []);

  const updateUserAddresses = useCallback((newAddresses) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, addresses: newAddresses } : { addresses: newAddresses };
      try {
        localStorage.setItem('supernova_auth_user', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const updateUserProfile = useCallback((profileData) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...profileData,
        fullName: {
          ...(prev?.fullName || {}),
          ...(profileData.fullName || {}),
        },
      };
      try {
        localStorage.setItem('supernova_auth_user', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const loginDemo = useCallback((demoRole = 'user') => {
    const demoUser = DEMO_ACCOUNTS[demoRole] || DEMO_ACCOUNTS.user;
    setUser(demoUser);
    localStorage.setItem('supernova_auth_user', JSON.stringify(demoUser));
    const target = getRedirectPath(demoUser.role);
    navigate(target);
    return demoUser;
  }, []);

  const value = {
    user,
    setUser,
    updateUserProfile,
    updateUserAddresses,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    loginDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
