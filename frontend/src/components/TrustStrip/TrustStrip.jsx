import { ShieldCheck, RefreshCw, Lock, Truck } from 'lucide-react';
import { useRevealOnScroll } from '../../hooks/useStorefront';
import styles from './TrustStrip.module.scss';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '100% Genuine Products', sub: 'Verified brand warranty' },
  { icon: RefreshCw, label: '7-Day Effortless Returns', sub: 'Doorstep pickup on request' },
  { icon: Lock, label: 'Encrypted 256-bit Checkout', sub: 'Strict bank-grade PCI standard' },
  { icon: Truck, label: 'Express Delivery Worldwide', sub: 'Fast, tracked doorstep delivery' },
];

export default function TrustStrip() {
  const ref = useRevealOnScroll(0.1);

  return (
    <div className={styles.strip} ref={ref}>
      {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
        <div key={label} className={styles.item}>
          <Icon size={22} strokeWidth={1.75} className={styles.icon} />
          <div>
            <p className={styles.label}>{label}</p>
            <p className={styles.sub}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
