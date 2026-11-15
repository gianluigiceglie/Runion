import { cx } from '../../utils/cx';
import styles from './PageDots.module.css';

export interface PageDotsProps {
  count: number;
  /** Zero-based active page. */
  active: number;
  /** Read out as e.g. "Slide 2 of 3". */
  label?: string;
  className?: string;
}

/** Figma "Slider-Dots": active page is a 24×8 pill in brand/secondary, others 8×8 muted dots. */
export function PageDots({ count, active, label = 'Slide', className }: PageDotsProps) {
  return (
    <div className={cx(styles.root, className)} role="status" aria-label={`${label} ${active + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx(styles.dot, i === active && styles.active)} aria-hidden="true" />
      ))}
    </div>
  );
}
