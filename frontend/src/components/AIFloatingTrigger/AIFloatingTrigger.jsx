import { useState } from 'react';
import styles from './AIFloatingTrigger.module.scss';

export default function AIFloatingTrigger({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className={styles.wrap}>
      {hovered && (
        <div className={styles.tooltip} aria-hidden="true">
          Ask AI-Buddy
        </div>
      )}
      <button
        className={styles.btn}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open AI-Buddy shopping assistant"
      >
        <span className={`${styles.sparkle} ${hovered ? styles.sparkleHovered : ''}`}>✦</span>
        <span className={styles.statusDot} />
      </button>
    </div>
  );
}
