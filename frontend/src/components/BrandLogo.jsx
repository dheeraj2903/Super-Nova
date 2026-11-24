import { useId } from 'react';
import styles from './BrandLogo.module.scss';

export default function BrandLogo({ className = '', href = '/', onClick }) {
  const clipId = useId();

  return (
    <a href={href} onClick={onClick} className={`${styles.logo} ${className}`} aria-label="SUPERNOVA">
      <span className={styles.text}>SUPERN</span>
      <span className={styles.emblem} aria-hidden="true">
        <svg
          viewBox="-18 -14 36 28"
          className={styles.svg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Clip path covering the lower/front half of the ring (y >= 0 in rotated ring space) */}
            <clipPath id={clipId}>
              <rect x="-25" y="0" width="50" height="25" />
            </clipPath>
          </defs>

          {/* ── Layer 1: Back half of tilted ring (-22deg) + Moon passing behind planet ── */}
          <g transform="rotate(-22)">
            {/* Back arc of the ring (upper half: y <= 0) */}
            <path
              d="M -15,0 A 15 5.2 0 0 1 15 0"
              fill="none"
              stroke="#C46210"
              strokeWidth="1.8"
              strokeOpacity="0.85"
            />
            {/* Moon dot in back layer: naturally occluded by the Deep Charcoal planet circle on back arc */}
            <circle r="2.8" fill="#C46210">
              <animateMotion
                path="M -15,0 a 15,5.2 0 1,0 30,0 a 15,5.2 0 1,0 -30,0"
                dur="7s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* ── Layer 2: Deep Charcoal planet circle (17px cap-height) occluding back layer ── */}
          <circle cx="0" cy="0" r="8.5" fill="#18181B" />

          {/* ── Layer 3: Front arc of ring + Moon emerging in front of planet on lower arc ── */}
          <g transform="rotate(-22)">
            {/* Front arc of the ring (lower half: y >= 0) */}
            <path
              d="M -15,0 A 15 5.2 0 0 0 15 0"
              fill="none"
              stroke="#C46210"
              strokeWidth="1.8"
            />
            {/* Front moon: clipped strictly to y >= 0 so it appears in front of planet on the front half */}
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
      <span className={styles.text}>VA</span>
    </a>
  );
}
