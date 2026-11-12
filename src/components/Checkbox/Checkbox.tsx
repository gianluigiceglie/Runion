import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { CheckSquare, MinusSquare, Square } from '@phosphor-icons/react';
import { FormHelperText, FormLabel } from '../FormField/FormField';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

/* ------------------------------------------------------------------- Checkbox */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Mixed state ("some selected"). Shown as a minus; screen readers announce "mixed". */
  indeterminate?: boolean;
}

/** A native checkbox, restyled. Use inside <FormControlLabel> or give it an aria-label. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, checked, defaultChecked, onChange, disabled, className, ...rest },
  ref,
) {
  const group = useContext(GroupCtx);
  const isDisabled = disabled ?? group?.disabled ?? false;
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);

  const controlled = checked !== undefined;
  const [own, setOwn] = useState(Boolean(defaultChecked));
  const isChecked = controlled ? Boolean(checked) : own;

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const Icon = indeterminate ? MinusSquare : isChecked ? CheckSquare : Square;

  return (
    <span className={cx(styles.box, className)} data-disabled={isDisabled ? 'true' : undefined}>
      <input
        ref={inner}
        type="checkbox"
        className={styles.input}
        checked={controlled ? isChecked : undefined}
        defaultChecked={controlled ? undefined : defaultChecked}
        disabled={isDisabled}
        aria-invalid={group?.error || undefined}
        aria-describedby={group?.describedBy}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (!controlled) setOwn(e.target.checked);
          onChange?.(e);
        }}
        {...rest}
      />
      <Icon aria-hidden="true" />
    </span>
  );
});

/* ------------------------------------------------------------ FormControlLabel */

export interface FormControlLabelProps {
  /** Usually a <Checkbox />. */
  control: ReactNode;
  label: ReactNode;
  /** Small text under the label (Figma "Show <FormHelperText>"). */
  helperText?: ReactNode;
  /** Figma "Label Placement". */
  labelPlacement?: 'end' | 'start';
  disabled?: boolean;
  className?: string;
}

/** Checkbox + clickable label (the whole row toggles the checkbox). */
export function FormControlLabel({ control, label, helperText, labelPlacement = 'end', disabled, className }: FormControlLabelProps) {
  const group = useContext(GroupCtx);
  const isDisabled = disabled ?? group?.disabled ?? false;
  return (
    <label className={cx(styles.control, labelPlacement === 'start' && styles.start, className)} data-disabled={isDisabled ? 'true' : undefined}>
      {control}
      <span className={styles.text}>
        <FormLabel as="span" state={isDisabled ? 'disabled' : 'enabled'}>
          {label}
        </FormLabel>
        {helperText && <FormHelperText status={isDisabled ? 'disabled' : 'default'}>{helperText}</FormHelperText>}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ FormGroup */

interface GroupContext {
  disabled: boolean;
  error: boolean;
  describedBy?: string;
}
const GroupCtx = createContext<GroupContext | null>(null);

export interface FormGroupProps {
  /** Group label (Figma "<FormLabel>"). */
  label?: ReactNode;
  /** Helper text under the label (Figma "<FormHelperText>"). */
  helperText?: ReactNode;
  /** Error message shown under the options when `state` is "error". */
  errorText?: ReactNode;
  /** Figma "State": Enabled, Disabled, Error. */
  state?: 'enabled' | 'disabled' | 'error';
  /** Lay options out in a row instead of a column. */
  row?: boolean;
  children: ReactNode;
  className?: string;
}

/** A <fieldset> grouping related checkboxes under one label with a shared state. */
export function FormGroup({ label, helperText, errorText, state = 'enabled', row = false, children, className }: FormGroupProps) {
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = state === 'error' && errorText ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  const disabled = state === 'disabled';
  const labelState = disabled ? 'disabled' : state === 'error' ? 'error' : 'enabled';

  return (
    <GroupCtx.Provider value={{ disabled, error: state === 'error', describedBy }}>
      <fieldset className={cx(styles.group, className)} disabled={disabled} aria-describedby={describedBy}>
        {(label || helperText) && (
          <div className={styles.groupHead}>
            {label && (
              <FormLabel as="legend" state={labelState}>
                {label}
              </FormLabel>
            )}
            {helperText && (
              <FormHelperText id={helperId} status={disabled ? 'disabled' : state === 'error' ? 'error' : 'default'}>
                {helperText}
              </FormHelperText>
            )}
          </div>
        )}
        <div className={cx(styles.items, row && styles.row)}>{children}</div>
        {errorId && (
          <FormHelperText id={errorId} status="error">
            {errorText}
          </FormHelperText>
        )}
      </fieldset>
    </GroupCtx.Provider>
  );
}
