import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { IconButton } from '../IconButton/IconButton';
import { cx } from '../../utils/cx';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export type TabsVariant = 'standard' | 'scrollable' | 'fullWidth';

export interface TabsProps {
  /** Base id; tabs get `${id}-tab-${value}`, panels `${id}-panel-${value}`. */
  id: string;
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Figma "Variant": Standard (content-fit), Scrollable, Full Width. */
  variant?: TabsVariant;
  /** Figma "Icon Position" (only used when items have icons). */
  iconPosition?: 'left' | 'up' | 'right';
  /** Accessible name for the tab list, e.g. "Profile sections". */
  'aria-label': string;
  className?: string;
}

export const tabId = (id: string, value: string) => `${id}-tab-${value}`;
export const panelId = (id: string, value: string) => `${id}-panel-${value}`;

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation):
 * ←/→ move and select, Home/End jump to first/last, disabled tabs are skipped.
 */
export function Tabs({ id, items, value, onChange, variant = 'standard', iconPosition = 'left', className, ...aria }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const enabled = items.filter((t) => !t.disabled);

  const focusTab = (v: string) => {
    const el = document.getElementById(tabId(id, v));
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = enabled.findIndex((t) => t.value === value);
    let next: TabItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    onChange(next.value);
    focusTab(next.value);
  };

  // Scroll buttons for the scrollable variant: shown only when there is more content that side.
  useEffect(() => {
    if (variant !== 'scrollable') return;
    const el = listRef.current;
    if (!el) return;
    const update = () => setCanScroll({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [variant, items.length]);

  const scrollBy = (dir: 1 | -1) => listRef.current?.scrollBy({ left: dir * listRef.current.clientWidth * 0.6 });

  return (
    <div className={cx(styles.root, variant === 'fullWidth' && styles.fullWidth, variant === 'scrollable' && styles.scrollable, className)}>
      {variant === 'scrollable' && (
        <IconButton
          className={styles.scrollButton}
          icon={<CaretLeft />}
          aria-label="Scroll tabs left"
          variant="ghost"
          color="secondary"
          size="small"
          disabled={!canScroll.left}
          tabIndex={-1}
          onClick={() => scrollBy(-1)}
        />
      )}
      <div ref={listRef} role="tablist" aria-orientation="horizontal" className={styles.list} onKeyDown={onKeyDown} {...aria}>
        {items.map((t) => {
          const selected = t.value === value;
          return (
            <button
              key={t.value}
              id={tabId(id, t.value)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(id, t.value)}
              tabIndex={selected ? 0 : -1}
              disabled={t.disabled}
              className={cx(styles.tab, Boolean(t.icon) && iconPosition === 'up' && styles.iconUp, Boolean(t.icon) && iconPosition === 'right' && styles.iconRight)}
              onClick={() => onChange(t.value)}
            >
              {t.icon && <span aria-hidden="true" style={{ display: 'contents' }}>{t.icon}</span>}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      {variant === 'scrollable' && (
        <IconButton
          className={styles.scrollButton}
          icon={<CaretRight />}
          aria-label="Scroll tabs right"
          variant="ghost"
          color="secondary"
          size="small"
          disabled={!canScroll.right}
          tabIndex={-1}
          onClick={() => scrollBy(1)}
        />
      )}
    </div>
  );
}

export interface TabPanelProps {
  /** Same id as the matching <Tabs>. */
  tabsId: string;
  value: string;
  /** The currently selected tab value; the panel renders only when it matches. */
  current: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ tabsId, value, current, children, className }: TabPanelProps) {
  if (value !== current) return null;
  return (
    <div role="tabpanel" id={panelId(tabsId, value)} aria-labelledby={tabId(tabsId, value)} tabIndex={0} className={cx(styles.panel, className)}>
      {children}
    </div>
  );
}
