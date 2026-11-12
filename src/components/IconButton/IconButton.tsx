import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import { cx } from '../../utils/cx';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'solid' | 'outlined' | 'ghost';
/** Figma "Color" property of <IconButton> (note: "error", where <Button> says "danger"). */
export type IconButtonColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type IconButtonSize = 'large' | 'medium' | 'small' | 'xsmall';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The icon to show, e.g. <PersonSimpleRun />. Sized by the button. */
  icon: ReactNode;
  /** Required: icon-only buttons need a text name for screen readers. */
  'aria-label': string;
  variant?: IconButtonVariant;
  color?: IconButtonColor;
  size?: IconButtonSize;
  /** Replaces the icon with a spinner and blocks clicks (Figma State=Loading). */
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'solid', color = 'primary', size = 'medium', loading = false, type = 'button', className, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-color={color}
      className={cx(styles.root, styles[variant], styles[size], loading && styles.loading, className)}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? <SpinnerGap className={styles.spin} aria-hidden="true" /> : <span aria-hidden="true" style={{ display: 'contents' }}>{icon}</span>}
    </button>
  );
});
