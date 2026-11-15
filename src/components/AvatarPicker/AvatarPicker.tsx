import { useEffect, useId, useRef, useState } from 'react';
import { Camera } from '@phosphor-icons/react';
import { Avatar } from '../Avatar/Avatar';
import { cx } from '../../utils/cx';
import styles from './AvatarPicker.module.css';

export interface AvatarPickerProps {
  /** Current image (object URL or data URL). */
  value?: string;
  onChange: (url: string | undefined) => void;
  /** Shown when there is no photo (e.g. `getInitials(firstName, lastName)`); with none, the user icon shows. */
  initials?: string;
  label?: string;
  /** Fixed id for the file input (so a form can focus it); generated otherwise. */
  id?: string;
  /** Validation message from the form (e.g. "required"). A file-type/size error from the picker itself wins. */
  error?: string;
  className?: string;
}

/**
 * Figma "Avatar + Action" (inside "Label+Profile-image-upload"): <Avatar> 80px Circular with a camera button.
 * Avatar content: the photo if chosen, else the initials, else the user icon.
 * The chosen photo stays in the browser (object URL); nothing is uploaded.
 */
export function AvatarPicker({ value, onChange, initials, label = 'Upload profile picture', id: fixedId, error: formError, className }: AvatarPickerProps) {
  const auto = useId();
  const id = fixedId ?? auto;
  const errorId = `${id}-error`;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const shownError = error ?? formError;

  // Release the previous object URL when the photo changes or the picker unmounts.
  useEffect(() => () => {
    if (value?.startsWith('blob:')) URL.revokeObjectURL(value);
  }, [value]);

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.circle}>
        <Avatar size={80} variant="circular" src={value} alt={value ? 'Your profile picture' : undefined} initials={initials} />
        <label htmlFor={id} className={styles.camera} title={label}>
          <Camera aria-hidden="true" />
          <span className="visually-hidden">{value ? 'Change profile picture' : label}</span>
        </label>
        <input
          ref={input}
          id={id}
          type="file"
          accept="image/*"
          className="visually-hidden"
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? errorId : undefined}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              setError('Choose an image file');
              return;
            }
            if (file.size > 10 * 1024 * 1024) {
              setError('Choose an image under 10 MB');
              return;
            }
            setError(undefined);
            onChange(URL.createObjectURL(file));
          }}
        />
      </div>
      {/* Picker errors (wrong file) are announced at once; form errors are read when the form focuses this input. */}
      {shownError && (
        <p id={errorId} className={styles.error} role={error ? 'alert' : undefined}>
          {shownError}
        </p>
      )}
    </div>
  );
}
