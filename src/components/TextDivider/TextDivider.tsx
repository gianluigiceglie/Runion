import { Divider } from '../Divider/Divider';
import styles from './TextDivider.module.css';

/** Figma "Divider" row on the login screen: line · text · line, gap 18. */
export function TextDivider({ children = 'or' }: { children?: string }) {
  return (
    <div className={styles.root} role="separator" aria-label={children}>
      <Divider className={styles.line} />
      <span className={styles.text} aria-hidden="true">
        {children}
      </span>
      <Divider className={styles.line} />
    </div>
  );
}
