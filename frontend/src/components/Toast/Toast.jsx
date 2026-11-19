import { useEffect } from 'react';
import styles from './Toast.module.scss';

export default function Toast({ message }) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.dot} />
      {message}
    </div>
  );
}
