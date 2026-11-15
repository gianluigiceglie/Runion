import styles from './ScreenBackground.module.css';

/** Figma "Background" variants. slide1/2/3 = "Slide1", "Slide2", "Variant5". */
export type ScreenBackgroundVariant = 'firstLevel' | 'slide1' | 'slide2' | 'slide3';

type Tone = 'info' | 'warning' | 'success';
interface Blob {
  tone: Tone;
  /** Figma frame coordinates (402 × 874). */
  x: number;
  y: number;
  size: number;
}

const W = 402;
const H = 874;

// Same three shapes on the slides, with the colours rotating per slide (from Figma).
const slideShapes = (a: Tone, b: Tone, c: Tone): Blob[] => [
  { tone: a, x: 37, y: -484, size: 865 },
  { tone: b, x: -67, y: 177, size: 537 },
  { tone: c, x: -252, y: 642, size: 711 },
];

const VARIANTS: Record<ScreenBackgroundVariant, Blob[]> = {
  firstLevel: [
    { tone: 'info', x: -98, y: -484, size: 598 },
    { tone: 'info', x: -98, y: 755, size: 598 },
  ],
  slide1: slideShapes('info', 'warning', 'success'),
  slide2: slideShapes('warning', 'success', 'info'),
  slide3: slideShapes('success', 'info', 'warning'),
};

export function ScreenBackground({ variant = 'firstLevel' }: { variant?: ScreenBackgroundVariant }) {
  return (
    <div className={styles.root} aria-hidden="true">
      {VARIANTS[variant].map((b, i) => (
        <span
          key={i}
          className={`${styles.blob} ${styles[b.tone]}`}
          style={{ left: `${(b.x / W) * 100}%`, top: `${(b.y / H) * 100}%`, width: `${(b.size / W) * 100}%` }}
        />
      ))}
    </div>
  );
}
