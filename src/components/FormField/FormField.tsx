import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { CaretDown, Eye, EyeSlash, X } from '@phosphor-icons/react';
import { IconButton } from '../IconButton/IconButton';
import { cx } from '../../utils/cx';
import styles from './FormField.module.css';

export type FieldStatus = 'default' | 'error' | 'success';
export type FieldSize = 'large' | 'medium';

/* ------------------------------------------------------------------ FormLabel */

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Figma "Color" (default "-" = foreground). */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  state?: 'enabled' | 'disabled' | 'error';
  required?: boolean;
  /** Render as <legend> when labelling a <fieldset> (FormGroup). */
  as?: 'label' | 'legend' | 'span';
}

export function FormLabel({ color, state = 'enabled', required, as = 'label', className, children, ...rest }: FormLabelProps) {
  const Tag = as as 'label';
  return (
    <Tag data-color={color} data-state={state} className={cx(styles.label, className)} {...rest}>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </Tag>
  );
}

/* ------------------------------------------------------------- FormHelperText */

export interface FormHelperTextProps {
  id?: string;
  /** Figma states: Enabled, Disabled, Error, Success. */
  status?: FieldStatus | 'disabled';
  children: ReactNode;
  className?: string;
}

export function FormHelperText({ id, status = 'default', children, className }: FormHelperTextProps) {
  return (
    <p id={id} data-status={status} className={cx(styles.helper, className)}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ FormField */

interface FieldContext {
  id: string;
  describedBy?: string;
  status: FieldStatus;
  disabled: boolean;
  required: boolean;
  size: FieldSize;
}
const FieldCtx = createContext<FieldContext | null>(null);

export interface FormFieldProps {
  label: ReactNode;
  /** Helper text shown under the label, above the control (Figma "HelperText:?"). */
  helperText?: ReactNode;
  /** Validation message shown under the control; coloured by `status`. */
  message?: ReactNode;
  status?: FieldStatus;
  disabled?: boolean;
  required?: boolean;
  size?: FieldSize;
  /** Optional fixed id for the control; generated otherwise. */
  id?: string;
  /** One control: <TextField>, <PasswordField>, <TextArea> or <Select>. */
  children: ReactNode;
  className?: string;
}

/** Wires label, helper text and message to the control (ids, aria-describedby, aria-invalid). */
export function FormField({ label, helperText, message, status = 'default', disabled = false, required = false, size = 'large', id, children, className }: FormFieldProps) {
  const auto = useId();
  const controlId = id ?? `field-${auto}`;
  const helperId = helperText ? `${controlId}-helper` : undefined;
  const messageId = message ? `${controlId}-message` : undefined;
  const describedBy = [helperId, messageId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldCtx.Provider value={{ id: controlId, describedBy, status, disabled, required, size }}>
      <div className={cx(styles.field, className)}>
        <div className={styles.head}>
          <FormLabel htmlFor={controlId} state={disabled ? 'disabled' : 'enabled'} required={required}>
            {label}
          </FormLabel>
          {helperText && (
            <FormHelperText id={helperId} status={disabled ? 'disabled' : 'default'}>
              {helperText}
            </FormHelperText>
          )}
        </div>
        {children}
        {message && (
          <FormHelperText id={messageId} status={disabled ? 'disabled' : status} className={styles.message}>
            {message}
          </FormHelperText>
        )}
      </div>
    </FieldCtx.Provider>
  );
}

/** Field props come from <FormField> when present; direct props win. */
function useField(p: { id?: string; disabled?: boolean; required?: boolean; status?: FieldStatus; size?: FieldSize; 'aria-describedby'?: string }) {
  const ctx = useContext(FieldCtx);
  const status = p.status ?? ctx?.status ?? 'default';
  return {
    id: p.id ?? ctx?.id,
    disabled: p.disabled ?? ctx?.disabled ?? false,
    required: p.required ?? ctx?.required ?? false,
    status,
    size: p.size ?? ctx?.size ?? 'large',
    describedBy: p['aria-describedby'] ?? ctx?.describedBy,
    invalid: status === 'error' || undefined,
  };
}

/** Controlled/uncontrolled string value helper. */
function useValue(value: unknown, defaultValue: unknown) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  return { current: controlled ? String(value ?? '') : inner, controlled, setInner };
}

/* ------------------------------------------------------------------ TextField */

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  status?: FieldStatus;
  size?: FieldSize;
  /** Show the clear (×) button when there is a value. Default true. */
  clearable?: boolean;
  /** Called after the clear button empties the field. */
  onClear?: () => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(props, ref) {
  return <InputBase {...props} ref={ref} kind="text" />;
});

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(props, ref) {
  return <InputBase {...props} ref={ref} kind="password" />;
});

const InputBase = forwardRef<HTMLInputElement, TextFieldProps & { kind: 'text' | 'password' }>(function InputBase(
  { kind, status: s, size: z, clearable = true, onClear, id: i, disabled: d, required: r, value, defaultValue, onChange, className, type, ...rest },
  ref,
) {
  const f = useField({ id: i, disabled: d, required: r, status: s, size: z, 'aria-describedby': rest['aria-describedby'] });
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const v = useValue(value, defaultValue);
  const [visible, setVisible] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!v.controlled) v.setInner(e.target.value);
    onChange?.(e);
  };

  const clear = () => {
    const el = inner.current;
    if (!el) return;
    // Use the native setter so React's onChange fires for controlled inputs too.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    onClear?.();
  };

  const showClear = clearable && v.current.length > 0 && !f.disabled && !rest.readOnly;

  return (
    <div className={cx(styles.shell, f.size === 'medium' && styles.medium, className)} data-status={f.status} data-disabled={f.disabled}>
      <input
        ref={inner}
        id={f.id}
        className={styles.input}
        type={kind === 'password' ? (visible ? 'text' : 'password') : (type ?? 'text')}
        disabled={f.disabled}
        required={f.required}
        aria-invalid={f.invalid}
        aria-describedby={f.describedBy}
        value={v.controlled ? v.current : undefined}
        defaultValue={v.controlled ? undefined : (defaultValue as string | undefined)}
        onChange={handleChange}
        {...rest}
      />
      {(showClear || kind === 'password') && (
        <span className={styles.actions}>
          {showClear && <IconButton className={styles.action} icon={<X />} aria-label="Clear" variant="ghost" color="secondary" size="small" onClick={clear} />}
          {kind === 'password' && (
            <IconButton
              className={styles.action}
              icon={visible ? <EyeSlash /> : <Eye />}
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              variant="ghost"
              color="secondary"
              size="small"
              disabled={f.disabled}
              onClick={() => setVisible((x) => !x)}
            />
          )}
        </span>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------- TextArea */

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: FieldStatus;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ status: s, id: i, disabled: d, required: r, className, rows = 4, ...rest }, ref) {
  const f = useField({ id: i, disabled: d, required: r, status: s, 'aria-describedby': rest['aria-describedby'] });
  return (
    <div className={cx(styles.shell, styles.textareaShell, className)} data-status={f.status} data-disabled={f.disabled}>
      <textarea
        ref={ref}
        id={f.id}
        rows={rows}
        className={cx(styles.input, styles.textarea)}
        disabled={f.disabled}
        required={f.required}
        aria-invalid={f.invalid}
        aria-describedby={f.describedBy}
        {...rest}
      />
    </div>
  );
});

/* --------------------------------------------------------------------- Select */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  /** Shown as an empty first option when there is no value. */
  placeholder?: string;
  status?: FieldStatus;
  size?: FieldSize;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, status: s, size: z, id: i, disabled: d, required: r, value, defaultValue, onChange, className, ...rest },
  ref,
) {
  const f = useField({ id: i, disabled: d, required: r, status: s, size: z, 'aria-describedby': rest['aria-describedby'] });
  const v = useValue(value, defaultValue);
  return (
    <div className={cx(styles.shell, styles.select, f.size === 'medium' && styles.medium, className)} data-status={f.status} data-disabled={f.disabled}>
      <select
        ref={ref}
        id={f.id}
        className={cx(styles.input, styles.nativeSelect)}
        disabled={f.disabled}
        required={f.required}
        aria-invalid={f.invalid}
        aria-describedby={f.describedBy}
        data-empty={v.current === ''}
        value={v.controlled ? v.current : undefined}
        defaultValue={v.controlled ? undefined : (defaultValue as string | undefined) ?? ''}
        onChange={(e) => {
          if (!v.controlled) v.setInner(e.target.value);
          onChange?.(e);
        }}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled={f.required}>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown className={styles.caret} aria-hidden="true" />
    </div>
  );
});
