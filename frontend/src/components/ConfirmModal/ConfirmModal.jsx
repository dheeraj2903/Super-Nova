import { useEffect } from 'react';
import styles from './ConfirmModal.module.scss';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className={styles.title}>
          {title}
        </h3>

        <p className={styles.description}>
          {description}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`${styles.confirmBtn} ${confirmVariant === 'primary' ? styles.primary : styles.danger}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
