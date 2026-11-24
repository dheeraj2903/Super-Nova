import { useState, useEffect, useId } from 'react';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Lock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import BrandLogo from '../components/BrandLogo';
import styles from './AuthPage.module.scss';

const SHOWCASE_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
    badge: 'STUDIO AUDIO',
    quote: 'Precision sound, crafted for everyday listening.',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    badge: 'TIMELESS ACCESSORIES',
    quote: 'Minimalist objects designed to endure.',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    badge: 'MODERN FOOTWEAR',
    quote: 'Effortless form meets daily comfort.',
  },
];

export default function AuthPage({ initialMode = 'login' }) {
  const { register, login, loginDemo } = useAuth();
  const clipId = useId();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState(initialMode);

  // Carousel slide state for customer auth (auto-advances every 3.8s)
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Role: defaults to 'user' unless explicitly passed in query string (?role=seller) or path is /sell
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'seller' || window.location.pathname === '/sell') return 'seller';
    }
    return 'user';
  });

  // Listen to URL search and path changes if updated externally
  useEffect(() => {
    const syncState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const isLogin = path === '/login';
        setMode(isLogin ? 'login' : 'signup');

        const isSeller = params.get('role') === 'seller' || path === '/sell';
        setRole(isSeller ? 'seller' : 'user');

        const initialHandle = params.get('handle') || params.get('username');
        if (initialHandle) {
          setUsername(initialHandle.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
        }
      } else {
        setMode(initialMode);
      }
    };

    syncState();
    window.addEventListener('popstate', syncState);
    return () => window.removeEventListener('popstate', syncState);
  }, [initialMode]);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const h = params.get('handle') || params.get('username');
      return h ? h.toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('email') || '';
    }
    return '';
  });
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const isSellerRole = role === 'seller' || searchParams.get('role') === 'seller';

  const handleSwitchMode = (newMode) => {
    setError('');
    setMode(newMode);
    if (isSellerRole) {
      const handleQuery = username ? `&handle=${encodeURIComponent(username)}` : '';
      navigate(newMode === 'signup' ? `/signup?role=seller${handleQuery}` : '/login?role=seller');
    } else {
      navigate(newMode === 'signup' ? '/signup' : '/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your full first and last name.');
        return;
      }
      if (!username.trim()) {
        setError(isSellerRole ? 'Please choose a seller handle.' : 'Please choose a username.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!agreeTerms) {
        setError('Please agree to the Terms of Service and Privacy Policy.');
        return;
      }

      setLoading(true);
      try {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role: isSellerRole ? 'seller' : 'user',
        });
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (!identifier.trim()) {
        setError(isSellerRole ? 'Please enter your email or seller handle.' : 'Please enter your email or username.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        await login({
          identifier: identifier.trim(),
          password,
        });
      } catch (err) {
        setError(err.message || 'Invalid credentials');
      } finally {
        setLoading(false);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: SELLER STUDIO SPLIT LAYOUT (when role === 'seller' in query params)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isSellerRole) {
    return (
      <div className={styles.authLayout}>
        {/* ── Left Panel (Bright #F3EDE2 Warm Sand with Minimalist Studio Craft Photo) ── */}
        <aside className={`${styles.leftCol} ${styles.sellerSandLeftCol}`}>
          {/* Top row: Back to Seller Overview + SUPERNOVA Brand Logo + SELLER badge */}
          <div className={styles.sellerLeftTopRow}>
            <a
              href="/sell"
              className={styles.sellerBackLink}
              onClick={(e) => {
                e.preventDefault();
                navigate('/sell');
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </a>

            <div className={styles.sellerBrandWrap}>
              <BrandLogo href="/sell" />
              <span className={styles.sellerBadgePill}>SELLER</span>
            </div>
          </div>

          {/* Centerpiece: Refined Minimal Warm-Stone Architectural / Matte-Desk Object Photograph */}
          <div className={styles.sellerCenterpiece}>
            <div className={styles.sellerPhotoFrame}>
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
                alt="Minimalist warm stone architectural objects"
                className={styles.sellerPhotoImg}
              />
            </div>

            <div className={styles.sellerCaptionBlock}>
              <p className={styles.sellerEditorialCaption}>
                Manage your catalog and orders effortlessly.
              </p>
            </div>
          </div>

          {/* Bottom spacer for balance */}
          <div className={styles.sellerBottomSpacer} aria-hidden="true" />
        </aside>

        {/* ── Right Panel (Warm Stone #FAF8F5 with Crisp White #FFFFFF elevated form container) ── */}
        <main className={styles.rightCol}>
          <div className={styles.mobileHeader}>
            <a
              href="/sell"
              className={styles.mobileReturn}
              onClick={(e) => {
                e.preventDefault();
                navigate('/sell');
              }}
            >
              <ArrowLeft size={14} /> Back
            </a>
            <div className={styles.sellerBrandWrap}>
              <BrandLogo href="/sell" />
              <span className={styles.sellerBadgePill}>SELLER</span>
            </div>
          </div>

          {/* Elevated Crisp White Form Container */}
          <div className={`${styles.formCard} ${styles.elevatedSellerFormCard}`}>
            {/* Header */}
            <div className={styles.formHeader}>
              <div className={styles.sellerStudioBadge}>
                <span className={styles.sellerBadgeDot}>•</span>
                <span>{mode === 'signup' ? 'SELLER REGISTRATION' : 'SELLER SIGN IN'}</span>
              </div>
              <h1 className={styles.heading}>
                {mode === 'signup' ? 'Create your seller account' : 'Seller Sign In'}
              </h1>
              <p className={styles.subtitle}>
                {mode === 'signup'
                  ? 'Enter your details to register as a Supernova merchant.'
                  : 'Enter your seller credentials to continue.'}
              </p>
            </div>

            {/* Toggle Pills: Create Seller Account | Seller Sign In (preserving ?role=seller) */}
            <div className={styles.modeToggleBar}>
              <button
                type="button"
                className={`${styles.modeToggleBtn} ${mode === 'signup' ? styles.modeActive : ''}`}
                onClick={() => handleSwitchMode('signup')}
              >
                Create Seller Account
              </button>
              <button
                type="button"
                className={`${styles.modeToggleBtn} ${mode === 'login' ? styles.modeActive : ''}`}
                onClick={() => handleSwitchMode('login')}
              >
                Seller Sign In
              </button>
            </div>

            {/* Form */}
            <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={styles.errorAlert} role="alert">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'signup' ? (
                <>
                  {/* First Name & Last Name */}
                  <div className={styles.twoColRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="sellerFirstName">
                        FIRST NAME
                      </label>
                      <input
                        id="sellerFirstName"
                        type="text"
                        className={styles.textInput}
                        placeholder="Elena"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="sellerLastName">
                        LAST NAME
                      </label>
                      <input
                        id="sellerLastName"
                        type="text"
                        className={styles.textInput}
                        placeholder="Rostova"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="sellerHandle">
                      USERNAME
                    </label>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputPrefixIcon}>@</span>
                      <input
                        id="sellerHandle"
                        type="text"
                        className={`${styles.textInput} ${styles.withPrefix}`}
                        placeholder="seller_handle"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="sellerEmail">
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="sellerEmail"
                      type="email"
                      className={styles.textInput}
                      placeholder="merchant@supernova.design"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password with Eye Toggle */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="sellerPassword">
                      PASSWORD
                    </label>
                    <div className={styles.inputWrap}>
                      <input
                        id="sellerPassword"
                        type={showPassword ? 'text' : 'password'}
                        className={`${styles.textInput} ${styles.withEye}`}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      I accept the{' '}
                      <a href="#" className={styles.inlineLink}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className={styles.inlineLink}>
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  {/* "Create Seller Account →" Button */}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className={styles.spinner} />
                        <span>Opening Store...</span>
                      </>
                    ) : (
                      <span>Create Seller Account &rarr;</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Email or Username */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="sellerLoginIdentifier">
                      EMAIL OR USERNAME
                    </label>
                    <input
                      id="sellerLoginIdentifier"
                      type="text"
                      className={styles.textInput}
                      placeholder="name@domain.com or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className={styles.fieldGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className={styles.fieldLabel} htmlFor="sellerLoginPassword">
                        PASSWORD
                      </label>
                      <a href="#" className={styles.inlineLink} style={{ fontSize: '11.5px' }}>
                        Forgot password?
                      </a>
                    </div>
                    <div className={styles.inputWrap}>
                      <input
                        id="sellerLoginPassword"
                        type={showPassword ? 'text' : 'password'}
                        className={`${styles.textInput} ${styles.withEye}`}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className={styles.spinner} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Seller Sign In &rarr;</span>
                    )}
                  </button>
                </>
              )}
            </form>

            {/* Quick-Access Demo Seller Pill */}
            <div className={styles.previewDivider}>
              <span className={styles.dividerText}>ONE-CLICK SELLER DEMO ACCESS</span>
            </div>

            <div className={styles.sellerDemoActionWrap}>
              <button
                type="button"
                className={styles.demoPillBtn}
                onClick={() => loginDemo('seller')}
                title="Instant login as Supernova Atelier (Seller)"
              >
                <span className={styles.demoDotSeller} />
                <span>Demo Seller</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: CUSTOMER / STANDARD AUTH LAYOUT (when role !== 'seller')
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.authLayout}>
      {/* ── Left Column (50% width, Deep Charcoal #141413) ── */}
      <aside className={styles.leftCol}>
        {/* Top row */}
        <div className={styles.leftTopRow}>
          <a
            href="/"
            className={styles.returnLink}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <ArrowLeft size={14} />
            <span>RETURN TO STOREFRONT</span>
          </a>

          {/* SUPERNOVA. wordmark with Saturn emblem */}
          <a
            href="/"
            className={styles.brandWordmark}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <span className={styles.brandText}>SUPERN</span>
            <span className={styles.brandEmblem} aria-hidden="true">
              <svg viewBox="-18 -14 36 28" className={styles.brandSvg}>
                <defs>
                  <clipPath id={clipId}>
                    <rect x="-25" y="0" width="50" height="25" />
                  </clipPath>
                </defs>
                <g transform="rotate(-22)">
                  <path
                    d="M -15,0 A 15 5.2 0 0 1 15 0"
                    fill="none"
                    stroke="#C46210"
                    strokeWidth="1.8"
                    strokeOpacity="0.85"
                  />
                  <circle r="2.8" fill="#C46210">
                    <animateMotion
                      path="M -15,0 a 15,5.2 0 1,0 30,0 a 15,5.2 0 1,0 -30,0"
                      dur="7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
                <circle cx="0" cy="0" r="8.5" fill="#141413" />
                <g transform="rotate(-22)">
                  <path
                    d="M -15,0 A 15 5.2 0 0 0 15 0"
                    fill="none"
                    stroke="#C46210"
                    strokeWidth="1.8"
                  />
                  <g clipPath={`url(#${clipId})`}>
                    <circle r="2.8" fill="#C46210">
                      <animateMotion
                        path="M -15,0 a 15,5.2 0 1,0 30,0 a 15,5.2 0 1,0 -30,0"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                </g>
              </svg>
            </span>
            <span className={styles.brandText}>VA.</span>
          </a>
        </div>

        {/* Centerpiece: 3-Slide Auto-Crossfade Ken Burns Motion Carousel */}
        <div className={styles.centerpiece}>
          <div className={styles.showcaseFrame}>
            {SHOWCASE_SLIDES.map((slide, idx) => (
              <div
                key={slide.image}
                className={`${styles.slide} ${idx === activeSlide ? styles.slideActive : ''}`}
                aria-hidden={idx !== activeSlide}
              >
                <img
                  src={slide.image}
                  alt={slide.badge}
                  className={styles.showcaseImg}
                />
              </div>
            ))}

            {/* Bottom-left subtle glass badge */}
            <div className={styles.showcaseBadge}>
              <span className={styles.bronzeDot} />
              <span>{SHOWCASE_SLIDES[activeSlide].badge}</span>
            </div>
          </div>

          <div className={styles.quoteBlock}>
            <p className={styles.editorialQuote}>
              &ldquo;{SHOWCASE_SLIDES[activeSlide].quote}&rdquo;
            </p>
            <span className={styles.quoteAuthor}>— SUPERNOVA</span>

            {/* 3 sleek minimal clickable indicator bars */}
            <div className={styles.carouselIndicators} role="tablist" aria-label="Showcase slides">
              {SHOWCASE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.indicatorBar} ${idx === activeSlide ? styles.indicatorActive : ''}`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  role="tab"
                  aria-selected={idx === activeSlide}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className={styles.leftTrustFooter}>
          <span className={styles.trustItem}>
            <Lock size={12} strokeWidth={2.2} />
            256-Bit Encrypted Session
          </span>
          <span className={styles.trustItem}>
            <ShieldCheck size={13} strokeWidth={2.2} />
            End-to-End Buyer Protection
          </span>
        </div>
      </aside>

      {/* ── Right Column (50% width, Warm Stone #FAF8F5, Zero-Scroll 100vh Fit) ── */}
      <main className={styles.rightCol}>
        <div className={styles.mobileHeader}>
          <a
            href="/"
            className={styles.mobileReturn}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <ArrowLeft size={14} /> Back to Store
          </a>
          <span style={{ fontWeight: 800, fontSize: 16 }}>SUPERNOVA.</span>
        </div>

        <div className={styles.formCard}>
          {/* Heading & Subtitle */}
          <div className={styles.formHeader}>
            <h1 className={styles.heading}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className={styles.subtitle}>
              {mode === 'signup'
                ? 'Enter your details to get started.'
                : 'Enter your details to continue.'}
            </p>
          </div>

          {/* Top Mode Toggle Pill */}
          <div className={styles.modeToggleBar}>
            <button
              type="button"
              className={`${styles.modeToggleBtn} ${mode === 'signup' ? styles.modeActive : ''}`}
              onClick={() => handleSwitchMode('signup')}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`${styles.modeToggleBtn} ${mode === 'login' ? styles.modeActive : ''}`}
              onClick={() => handleSwitchMode('login')}
            >
              Sign In
            </button>
          </div>

          {/* Main Auth Form */}
          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            {error && (
              <div className={styles.errorAlert} role="alert">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' ? (
              <>
                {/* 2-column row: First Name and Last Name */}
                <div className={styles.twoColRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="firstName">
                      FIRST NAME
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className={styles.textInput}
                      placeholder="Elena"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="lastName">
                      LAST NAME
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className={styles.textInput}
                      placeholder="Rostova"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Username with @ prefix */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="signupUsername">
                    USERNAME
                  </label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputPrefixIcon}>@</span>
                    <input
                      id="signupUsername"
                      type="text"
                      className={`${styles.textInput} ${styles.withPrefix}`}
                      placeholder="elena_rostova"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="signupEmail">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="signupEmail"
                    type="email"
                    className={styles.textInput}
                    placeholder="elena@supernova.design"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="signupPassword">
                    PASSWORD
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      id="signupPassword"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.textInput} ${styles.withEye}`}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>
                    I accept the{' '}
                    <a href="#" className={styles.inlineLink}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className={styles.inlineLink}>
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account &rarr;</span>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Email or Username */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="loginIdentifier">
                    EMAIL OR USERNAME
                  </label>
                  <input
                    id="loginIdentifier"
                    type="text"
                    className={styles.textInput}
                    placeholder="name@domain.com or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div className={styles.fieldGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.fieldLabel} htmlFor="loginPassword">
                      PASSWORD
                    </label>
                    <a href="#" className={styles.inlineLink} style={{ fontSize: '11.5px' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div className={styles.inputWrap}>
                    <input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.textInput} ${styles.withEye}`}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In &rarr;</span>
                  )}
                </button>
              </>
            )}
          </form>

          {/* One-Click Preview Access */}
          <div className={styles.previewDivider}>
            <span className={styles.dividerText}>ONE-CLICK PREVIEW ACCESS</span>
          </div>

          <div className={styles.demoPillRow}>
            <button
              type="button"
              className={styles.demoPillBtn}
              onClick={() => loginDemo('user')}
              title="Instant login as Elena Rostova (Customer)"
            >
              <span className={styles.demoDotCustomer} />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              className={styles.demoPillBtn}
              onClick={() => loginDemo('seller')}
              title="Instant login as Supernova Atelier (Seller)"
            >
              <span className={styles.demoDotSeller} />
              <span>Demo Seller</span>
            </button>
            <button
              type="button"
              className={styles.demoPillBtn}
              onClick={() => loginDemo('admin')}
              title="Instant login as Platform Admin (Admin)"
            >
              <span className={styles.demoDotAdmin} />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
