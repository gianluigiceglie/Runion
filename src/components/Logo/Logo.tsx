import fullUrl from '../../assets/logo/runion-full.svg';
import fullWhiteUrl from '../../assets/logo/runion-full-white.svg';
import shortUrl from '../../assets/logo/runion-short.svg';
import shortWhiteUrl from '../../assets/logo/runion-short-white.svg';
import { cx } from '../../utils/cx';
import styles from './Logo.module.css';

export interface LogoProps {
  /** Figma Logo variants: Full (symbol + wordmark) or Short (symbol only). */
  variant?: 'full' | 'short';
  /** Rendered height in px (Figma: 57 on the splash, 48 in the slide header). */
  height?: number;
  className?: string;
}

const SOURCES = {
  full: { light: fullUrl, dark: fullWhiteUrl },
  // Figma has no white Short variant; this one uses the White logo's colour (#F1F5F9).
  short: { light: shortUrl, dark: shortWhiteUrl },
};

/** Runion logo. Swaps to the white version in dark mode so it stays visible. */
export function Logo({ variant = 'full', height = 57, className }: LogoProps) {
  const src = SOURCES[variant];
  return (
    <span className={cx(styles.wrap, className)} style={{ height }}>
      <img src={src.light} alt="Runion" height={height} className={cx(styles.img, styles.light)} />
      <img src={src.dark} alt="" aria-hidden="true" height={height} className={cx(styles.img, styles.dark)} />
    </span>
  );
}
