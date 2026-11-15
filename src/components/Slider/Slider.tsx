import { useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Slider.module.css';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Show a mark at every step, both ends included (Figma _SliderMark). */
  marks?: boolean;
  /**
   * Labels under the slider (Figma "Values" row).
   * Left: the current value, updating while the thumb moves (Figma _SliderValue Label Active=true). Right: the maximum.
   * Pass `minLabel` / `maxLabel` to replace them.
   */
  minLabel?: ReactNode;
  maxLabel?: ReactNode;
  showValues?: boolean;
  /** Required unless the slider is labelled by a visible element (aria-labelledby). */
  'aria-label'?: string;
  /** How the current value is read out, e.g. v => `${v} km`. */
  formatValue?: (value: number) => string;
}

/**
 * A slider is an interactive form control that allows users to select a single value or a continuous range of values
 * by moving a draggable thumb along a horizontal track.
 *
 * (Figma "<Slider>" description.) Built: single value, Medium size. The value under the left end updates while dragging.
 * Not built yet: range (two thumbs) and the Small size (_SliderTrack / _SliderRail Size=Small, 2px).
 */
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  marks = false,
  minLabel,
  maxLabel,
  showValues = true,
  formatValue,
  disabled,
  className,
  ...rest
}: SliderProps) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = controlled ? value : inner;
  const pct = max > min ? (current - min) / (max - min) : 0;
  const markCount = marks && step > 0 ? Math.floor((max - min) / step) : 0;
  const format = (v: number) => (formatValue ? formatValue(v) : String(v));

  return (
    <div className={cx(styles.root, className)} data-disabled={disabled ? 'true' : undefined}>
      <div className={styles.control} style={{ '--pct': pct } as CSSProperties}>
        {/* Figma layer order: _SliderTrack (full bar), _SliderRail (filled part), then the marks on top. */}
        <span className={styles.track} />
        <span className={styles.rail} />
        {/* One mark per step, both ends included (Figma: 2–10 in steps of 2 → 5 marks). */}
        {markCount > 0 &&
          Array.from({ length: markCount + 1 }, (_, i) => (
            <span key={i} className={styles.mark} style={{ '--at': i / markCount } as CSSProperties} />
          ))}
        <input
          type="range"
          className={styles.input}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          aria-valuetext={format(current)}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!controlled) setInner(v);
            onChange?.(v);
          }}
          {...rest}
        />
      </div>
      {showValues && (
        // Hidden from screen readers: the input already announces its value (aria-valuetext).
        <div className={styles.values} aria-hidden="true">
          <span>{minLabel ?? format(current)}</span>
          <span>{maxLabel ?? format(max)}</span>
        </div>
      )}
    </div>
  );
}
