import { CaretLeft, CaretRight, Circle } from '@phosphor-icons/react';
import { IconButton } from '../IconButton/IconButton';
import { cx } from '../../utils/cx';
import styles from './MobileStepper.module.css';

export interface MobileStepperProps {
  /** Total number of steps (at least 1). */
  steps: number;
  /** Zero-based index of the current step. */
  activeStep: number;
  /** Figma "Progress Type". */
  variant?: 'dots' | 'text';
  /** Dots variant only. Omit to hide the back/next buttons. */
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  className?: string;
}

/**
 * Compact progress for multi-step flows on small screens.
 * Dots: active step is a filled circle, others outlined. Progress is announced as "Step x of n".
 */
export function MobileStepper({ steps, activeStep, variant = 'dots', onBack, onNext, backLabel = 'Back', nextLabel = 'Next', className }: MobileStepperProps) {
  const total = Math.max(1, Math.floor(steps));
  const active = Math.min(Math.max(0, activeStep), total - 1);
  const status = `Step ${active + 1} of ${total}`;

  if (variant === 'text') {
    return (
      <div className={cx(styles.root, styles.textOnly, className)} role="status" aria-label={status}>
        <span className={styles.text} aria-hidden="true">
          {active + 1}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className={cx(styles.root, className)}>
      {onBack && (
        <IconButton className={styles.nav} icon={<CaretLeft />} aria-label={backLabel} variant="ghost" color="secondary" size="small" disabled={active === 0} onClick={onBack} />
      )}
      <span className={styles.dots} role="status" aria-label={status}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={styles.dot} aria-hidden="true">
            <Circle weight={i === active ? 'fill' : 'regular'} />
          </span>
        ))}
      </span>
      {onNext && (
        <IconButton className={styles.nav} icon={<CaretRight />} aria-label={nextLabel} variant="ghost" color="secondary" size="small" disabled={active === total - 1} onClick={onNext} />
      )}
    </div>
  );
}
