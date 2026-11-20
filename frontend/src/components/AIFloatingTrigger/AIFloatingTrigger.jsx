import { useState } from 'react';
import AiSparkleIcon from '../AiSparkleIcon';
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
        <span className={`${styles.sparkle} ${hovered ? styles.sparkleHovered : ''}`}>
          <AiSparkleIcon size={18} fill="#FFFFFF" />
        </span>
        <span className={styles.label}>Ask AI</span>
      </button>
    </div>
  );
}
