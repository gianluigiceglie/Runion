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
  /** Show a mark at every step (Figma _SliderMark). */
  marks?: boolean;
  /** Labels under the slider, left and right (Figma "Values" row). Defaults to min and max. */
  minLabel?: ReactNode;
  maxLabel?: ReactNode;
  showValues?: boolean;
  /** Required unless the slider is labelled by a visible element (aria-labelledby). */
  'aria-label'?: string;
  /** How the current value is read out, e.g. v => `${v} km`. */
  formatValue?: (value: number) => string;
}

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

  return (
    <div className={cx(styles.root, className)} data-disabled={disabled ? 'true' : undefined}>
      <div className={styles.control} style={{ '--pct': pct } as CSSProperties}>
        <span className={styles.rail} />
        {Array.from({ length: Math.max(0, markCount - 1) }, (_, i) => (
          <span key={i} className={styles.mark} style={{ '--at': (i + 1) / markCount } as CSSProperties} />
        ))}
        <span className={styles.track} />
        <input
          type="range"
          className={styles.input}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          aria-valuetext={formatValue ? formatValue(current) : undefined}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!controlled) setInner(v);
            onChange?.(v);
          }}
          {...rest}
        />
      </div>
      {showValues && (
        <div className={styles.values} aria-hidden="true">
          <span>{minLabel ?? (formatValue ? formatValue(min) : min)}</span>
          <span>{maxLabel ?? (formatValue ? formatValue(max) : max)}</span>
        </div>
      )}
    </div>
  );
}
