import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import AiSparkleIcon from '../AiSparkleIcon';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import { GLOBAL_SKELETON_MS } from '../../constants/ui';
import styles from './Hero.module.scss';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=85&auto=format&fit=crop',
    alt: 'Matte-black ANC studio headphones on warm neutral stone',
    tag: '01 / 04 · Studio Audio',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85&auto=format&fit=crop',
    alt: 'Minimalist analog watch with precision craftsmanship',
    tag: '02 / 04 · Timepiece',
  },
  {
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&q=85&auto=format&fit=crop',
    alt: 'Clean knit studio sneakers on minimalist background',
    tag: '03 / 04 · Footwear',
  },
  {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85&auto=format&fit=crop',
    alt: 'Handcrafted full-grain leather tech folio',
    tag: '04 / 04 · Leather Goods',
  },
];

const DURATION = 4500;

export default function Hero({ onBuddyClick, loading: propLoading }) {
  const ref = useRevealOnScroll(0.1);
  const [internalLoading, setInternalLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timeoutRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(DURATION);

  useEffect(() => {
    if (propLoading !== undefined) {
      setInternalLoading(propLoading);
    } else {
      const timer = setTimeout(() => setInternalLoading(false), GLOBAL_SKELETON_MS);
      return () => clearTimeout(timer);
    }
  }, [propLoading]);

  const isLoading = propLoading !== undefined ? propLoading : internalLoading;

  const goToSlide = (idx) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    remainingRef.current = DURATION;
    startTimeRef.current = Date.now();
    setActiveSlide(idx);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    remainingRef.current = DURATION;
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (isLoading) return;

    if (isPaused) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    } else {
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, remainingRef.current);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeSlide, isPaused, isLoading]);

  if (isLoading) {
    return (
      <section className={`${styles.hero} ${styles.heroSkeleton} container`}>
        <div className={styles.left}>
          <div className={styles.skelBadge} />
          <div className={styles.skelTitleWrap}>
            <div className={styles.skelTitleLine1} />
            <div className={styles.skelTitleLine2} />
          </div>
          <div className={styles.skelSubtitleWrap}>
            <div className={styles.skelSubtitle1} />
            <div className={styles.skelSubtitle2} />
          </div>
          <div className={styles.skelCtas}>
            <div className={styles.skelCta1} />
            <div className={styles.skelCta2} />
          </div>
          <div className={styles.skelTrust}>
            <div className={styles.skelTrustItem} />
            <div className={styles.skelTrustItem} />
          </div>
        </div>
        <div className={styles.skelRight} />
      </section>
    );
  }

  return (
    <section className={`${styles.hero} container`} ref={ref}>
      <div className={styles.left}>
        <span className={styles.badge}>SEASONAL EDIT · UP TO 50% OFF</span>

        <h1 className={styles.headline}>
          <span className={styles.lineMask}>
            <span className={styles.line1}>Elevate Your Everyday</span>
          </span>
          <span className={styles.lineMask}>
            <span className={styles.line2}>
              <span className={styles.essentials}>Essentials</span>
              <span className={styles.bronzeDot} aria-hidden="true" />
            </span>
          </span>
        </h1>

        <p className={styles.subtitle}>
          Curated electronics, footwear, audio, and home goods delivered fast.
        </p>

        <div className={styles.ctas}>
          <a href="#shop-grid" className={styles.ctaSolid}>
            Shop Collection <ArrowRight size={16} strokeWidth={2} />
          </a>
          <button className={styles.ctaOutline} onClick={onBuddyClick}>
            <AiSparkleIcon size={16} /> Ask AI-Buddy
          </button>
        </div>

        <div className={styles.trustStrip}>
          <span className={styles.trustItem}>
            <span className={styles.trustDot} />
            500+ VERIFIED BRANDS
          </span>
          <span className={styles.trustItem}>
            <Zap size={12} strokeWidth={2.5} />
            SAME-DAY DISPATCH IN 14 METROS
          </span>
        </div>
      </div>

      <div
        className={styles.right}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={styles.sliderContainer}>
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              className={`${styles.heroImage} ${idx === activeSlide ? styles.slideActive : styles.slideInactive}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        {/* Sleek floating glass pill in bottom-left */}
        <div className={styles.floatingPill}>
          <span>{HERO_SLIDES[activeSlide].tag}</span>
        </div>

        {/* Live Bronze indicator pills in bottom-right */}
        <div className={styles.progressPills} aria-label="Hero slider indicators">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.progressPill} ${idx === activeSlide ? styles.progressPillActive : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {idx === activeSlide && (
                <span
                  key={activeSlide}
                  className={`${styles.progressBar} ${isPaused ? styles.paused : ''}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
