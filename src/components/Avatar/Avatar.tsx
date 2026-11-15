import { useEffect, useState, type CSSProperties } from 'react';
import { User } from '@phosphor-icons/react';
import { cx } from '../../utils/cx';
import styles from './Avatar.module.css';

/** Figma "Size" (px). */
export type AvatarSize = 24 | 32 | 40 | 60 | 80 | 120;
/** Figma "Variant". */
export type AvatarVariant = 'circular' | 'rounded' | 'square';
/** Figma "Content". Chosen automatically from the props (see `Avatar`). */
export type AvatarContent = 'image' | 'text' | 'icon';

export interface AvatarProps {
  /** Photo URL (Figma Content=Image). If it fails to load, the avatar falls back to initials or the icon. */
  src?: string;
  /** Alt text for the photo. Leave empty when the avatar sits next to the person's name. */
  alt?: string;
  /** Figma "Initials" (Content=Text), e.g. `getInitials(firstName, lastName)`. Used when there is no photo. */
  initials?: string;
  /** Figma "Size" in px. Default 120, as in Figma. */
  size?: AvatarSize;
  /** Figma "Variant". */
  variant?: AvatarVariant;
  /** Figma "Badge": success status dot in the bottom-right corner. */
  badge?: boolean;
  /** Screen-reader text for the badge (e.g. "Online"). Without it the badge is decorative. */
  badgeLabel?: string;
  /** Accessible name for initials/icon avatars (e.g. "Mario Rossi"). Without it they are decorative. */
  label?: string;
  className?: string;
}

/** Figma text style per size (Content=Text): 24 → body-xs, 32 → body-md, 40–80 → body-lg, 120 → body-xl, all semi-bold. */
const TEXT_CLASS: Record<AvatarSize, string> = {
  24: 'text-body-xs-semi-bold',
  32: 'text-body-md-semi-bold',
  40: 'text-body-lg-semi-bold',
  60: 'text-body-lg-semi-bold',
  80: 'text-body-lg-semi-bold',
  120: 'text-body-xl-semi-bold',
};
/** Figma <Icon> size per avatar size (Content=Icon): x-small 16, small 20, medium 24. */
const ICON_PX: Record<AvatarSize, number> = { 24: 16, 32: 20, 40: 24, 60: 24, 80: 24, 120: 24 };
/** Figma badge: outer ring size and ring thickness per avatar size (dot = ring − 2 × thickness). 24px has no ring. */
const BADGE: Record<AvatarSize, { ring: number; thickness: number }> = {
  24: { ring: 8, thickness: 0 },
  32: { ring: 12, thickness: 2 },
  40: { ring: 12, thickness: 2 },
  60: { ring: 12, thickness: 2 },
  80: { ring: 24, thickness: 4 },
  120: { ring: 32, thickness: 16 / 3 },
};

/** First letter of the first name + first letter of the last name, upper-case ("Mario", "Rossi" → "MR"). Empty parts are skipped. */
export function getInitials(...names: Array<string | undefined>): string {
  return names
    .map((n) => Array.from((n ?? '').trim())[0] ?? '') // Array.from keeps letters outside the BMP whole
    .join('')
    .toLocaleUpperCase();
}

/**
 * An Avatar is a visual representation of a user or entity. It displays a profile photograph when available,
 * and gracefully falls back to user initials or a generic silhouette icon when no image is provided or if the image
 * fails to load. Avatars can also display real-time presence indicators or contextual badges.
 *
 * (Figma "<Avatar>" description.) Three shapes, six sizes, optional success badge.
 */
export function Avatar({ src, alt = '', initials, size = 120, variant = 'circular', badge = false, badgeLabel, label, className }: AvatarProps) {
  // A photo that fails to load falls back to initials / icon (Figma description). Reset when the photo changes.
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const text = initials?.trim();
  const content: AvatarContent = src && !failed ? 'image' : text ? 'text' : 'icon';
  const named = content !== 'image' && label;
  const { ring, thickness } = BADGE[size];

  return (
    <span
      className={cx(styles.root, className)}
      data-variant={variant}
      data-content={content}
      style={{ '--avatar-size': `${size}px`, '--badge-ring': `${ring}px`, '--badge-thickness': `${thickness}px` } as CSSProperties}
    >
      <span
        className={cx(styles.face, content === 'text' && TEXT_CLASS[size])}
        {...(named ? { role: 'img', 'aria-label': label } : content === 'image' ? {} : { 'aria-hidden': true })}
      >
        {content === 'image' && <img src={src} alt={alt} className={styles.img} onError={() => setFailed(true)} />}
        {content === 'text' && text}
        {content === 'icon' && <User size={ICON_PX[size]} aria-hidden="true" />}
      </span>
      {badge && (
        <span className={styles.badge} {...(badgeLabel ? { role: 'img', 'aria-label': badgeLabel } : { 'aria-hidden': true })}>
          <span className={styles.dot} />
        </span>
      )}
    </span>
  );
}
