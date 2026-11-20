import { useState } from 'react';
import styles from './AIFloatingTrigger.module.scss';

export default function AIFloatingTrigger({ onClick, isOpen, isCartOpen }) {
  const [hovered, setHovered] = useState(false);

  if (isOpen || isCartOpen) return null;

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open AI-Buddy shopping assistant"
      >
        <span className={`${styles.sparkle} ${hovered ? styles.sparkleHovered : ''}`}>✦</span>
        <span className={styles.label}>Ask AI</span>
      </button>
    </div>
  );
}
