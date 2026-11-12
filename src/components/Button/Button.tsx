import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'solid' | 'outlined' | 'ghost';
/** Figma "Color" property of <Button>. */
export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';
export type ButtonSize = 'large' | 'medium' | 'small';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  /** Icon before the label (Figma "Left-icon"). Sized by the button. */
  startIcon?: ReactNode;
  /** Icon after the label (Figma "Right-icon"). Sized by the button. */
  endIcon?: ReactNode;
  /** Shows a spinner after the label and blocks clicks (Figma State=Loading). */
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    color = 'primary',
    size = 'medium',
    startIcon,
    endIcon,
    loading = false,
    fullWidth = false,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-color={color}
      className={cx(styles.root, styles[variant], styles[size], fullWidth && styles.fullWidth, loading && styles.loading, className)}
      aria-busy={loading || undefined}
      // While loading the button stays focusable (no `disabled`) but ignores clicks.
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {startIcon && !loading && (
        <span className={styles.icon} aria-hidden="true">
          {startIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {loading ? (
        <span className={styles.icon} aria-hidden="true">
          <SpinnerGap className={styles.spin} />
        </span>
      ) : (
        endIcon && (
          <span className={styles.icon} aria-hidden="true">
            {endIcon}
          </span>
        )
      )}
    </button>
  );
});
