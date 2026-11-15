import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cx } from '../../utils/cx';
import styles from './CodeInput.module.css';

export interface CodeInputProps {
  /** Number of digits (Figma: 6 boxes). */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Called once every box is filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  status?: 'default' | 'error';
  /** Accessible name for the group, e.g. "Verification code". */
  label?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * One-time code entry: one 40×40 box per digit (Figma: TextField Medium).
 * Typing moves to the next box, Backspace to the previous one, and pasting a code fills all boxes.
 */
export function CodeInput({ length = 6, value, onChange, onComplete, disabled, status = 'default', label = 'Verification code', autoFocus, className }: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const setAt = (i: number, d: string) => {
    const arr = digits.slice();
    arr[i] = d;
    // Keep digits contiguous: a cleared box removes that digit.
    commit(arr.join(''));
  };

  const onInput = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, '');
    if (!only) return;
    if (only.length > 1) {
      // Autofill / fast typing: spread from this box onwards.
      commit((value.slice(0, i) + only).slice(0, length));
      focus(i + only.length);
      return;
    }
    setAt(i, only);
    focus(i + 1);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) setAt(i, '');
      else if (i > 0) {
        setAt(i - 1, '');
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    commit(text);
    focus(text.length);
  };

  return (
    <div className={cx(styles.root, className)} role="group" aria-label={label}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.box}
          data-status={status}
          value={d}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? length : 1}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={status === 'error' || undefined}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
