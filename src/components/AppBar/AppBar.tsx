import type { ReactNode } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { IconButton } from '../IconButton/IconButton';
import { cx } from '../../utils/cx';
import styles from './AppBar.module.css';

export interface AppBarProps {
  /** Figma <AppBar> Variant=Child: a back button on the left. */
  onBack?: () => void;
  backLabel?: string;
  title?: ReactNode;
  /** Content on the right (e.g. an IconButton). */
  actions?: ReactNode;
  className?: string;
}

export function AppBar({ onBack, backLabel = 'Back', title, actions, className }: AppBarProps) {
  return (
    <header className={cx(styles.root, className)}>
      {onBack && <IconButton icon={<CaretLeft />} aria-label={backLabel} variant="ghost" color="secondary" size="medium" onClick={onBack} />}
      {title && <h1 className={styles.title}>{title}</h1>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
