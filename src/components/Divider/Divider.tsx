import { cx } from '../../utils/cx';
import styles from './Divider.module.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/** 1px line in border/primary/default (Figma <Divider> Horizontal / Vertical). */
export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return orientation === 'horizontal' ? (
    <hr className={cx(styles.horizontal, className)} />
  ) : (
    <div role="separator" aria-orientation="vertical" className={cx(styles.vertical, className)} />
  );
}
