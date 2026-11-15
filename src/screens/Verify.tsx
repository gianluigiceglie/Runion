import { useEffect, useState } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import { AppBar } from '../components/AppBar/AppBar';
import { Button } from '../components/Button/Button';
import { CodeInput } from '../components/CodeInput/CodeInput';
import { IconButton } from '../components/IconButton/IconButton';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { useOnboarding } from '../app/OnboardingState';
import { navigate } from '../app/router';
import s from './Screen.module.css';
import styles from './Verify.module.css';

const LENGTH = 6;
const RESEND_AFTER_S = 60;

const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

/**
 * Figma "↳ Sign up - Validation code". Sign up only (log in skips it).
 * Prototype: any 6 digits are accepted (no email is really sent); "Resend code" unlocks after a 60-second countdown.
 */
export function Verify() {
  const { data } = useOnboarding();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_AFTER_S);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  const back = () => navigate('/auth/signup');
  const verify = () => {
    if (code.length !== LENGTH) return;
    setBusy(true);
    window.setTimeout(() => navigate('/profile/1'), 600);
  };
  const resend = () => {
    setCode('');
    setLeft(RESEND_AFTER_S);
    setNotice('We sent you a new code.');
  };

  return (
    <div className={s.screen}>
      <ScreenBackground variant="firstLevel" />
      <div className={s.body}>
        <AppBar onBack={back} backLabel="Back to sign up" />
        <div className={s.center}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <div className={styles.heading}>
              <h1 className={`text-body-md-regular ${styles.title}`}>We sent a code to</h1>
              <div className={styles.email}>
                <span className="text-body-md-semi-bold">{data.email || 'your email'}</span>
                <IconButton icon={<PencilSimple />} aria-label="Change email address" variant="ghost" color="primary" size="xsmall" onClick={back} />
              </div>
            </div>

            <CodeInput length={LENGTH} value={code} onChange={setCode} autoFocus label="6-digit verification code" />

            <Button type="submit" fullWidth disabled={code.length !== LENGTH} loading={busy}>
              Verify code
            </Button>

            <div className={styles.footer}>
              <p className="text-body-md-regular">Didn’t receive the code?</p>
              <Button variant="ghost" size="small" disabled={left > 0} onClick={resend}>
                Resend code
              </Button>
              {left > 0 && (
                <p className="text-body-md-regular" aria-live="off">
                  wait {mmss(left)}
                </p>
              )}
              <p className="visually-hidden" role="status">
                {notice}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
