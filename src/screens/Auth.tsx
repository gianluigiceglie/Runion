import { useState, type FormEvent } from 'react';
import { Button } from '../components/Button/Button';
import { FormField, TextField } from '../components/FormField/FormField';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { TabPanel, Tabs } from '../components/Tabs/Tabs';
import { TextDivider } from '../components/TextDivider/TextDivider';
import { useOnboarding } from '../app/OnboardingState';
import { navigate } from '../app/router';
import googleUrl from '../assets/icons/google-g.svg';
import s from './Screen.module.css';
import styles from './Auth.module.css';

type Tab = 'login' | 'signup';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FAKE_DELAY_MS = 700; // short "loading" so buttons feel real; nothing is sent anywhere

/**
 * Figma "↳ Log in / Sign up". Prototype behaviour:
 * - Log in (email or Google): straight to the Home placeholder, no code;
 * - Sign up with email: code screen → profile setup;
 * - Sign up with Google (simulated): straight to profile setup.
 */
export function Auth({ tab }: { tab: Tab }) {
  const { data, update } = useOnboarding();
  const [email, setEmail] = useState(data.email);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);

  const switchTab = (t: string) => {
    setError(undefined);
    navigate(`/auth/${t}`, { replace: true });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(value ? 'Enter a valid email address' : 'Enter your email address');
      return;
    }
    setBusy('email');
    window.setTimeout(() => {
      update({ email: value, mode: tab });
      navigate(tab === 'login' ? '/home' : '/verify');
    }, FAKE_DELAY_MS);
  };

  const google = () => {
    setBusy('google');
    window.setTimeout(() => {
      update({ email: email.trim() || 'runner@example.com', mode: tab });
      navigate(tab === 'login' ? '/home' : '/profile/1');
    }, FAKE_DELAY_MS);
  };

  const googleIcon = <img src={googleUrl} alt="" width={24} height={24} />;
  const emailField = (
    <FormField label="Email" status={error ? 'error' : 'default'} message={error}>
      <TextField
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(undefined);
        }}
      />
    </FormField>
  );

  return (
    <div className={s.screen}>
      <ScreenBackground variant="firstLevel" />
      <div className={s.body}>
        <div className={s.center}>
          <div className={styles.content}>
            <div className={styles.heading}>
              <h1 className={`text-h1 ${s.h1}`}>Welcome</h1>
              <p className={`text-body-xl-regular ${s.lead}`}>
                Access to your account for your next <strong className={styles.strong}>running experience</strong>!
              </p>
            </div>

            <div className={styles.tabs}>
              <Tabs
                id="auth"
                aria-label="Log in or sign up"
                variant="fullWidth"
                value={tab}
                onChange={switchTab}
                items={[
                  { value: 'login', label: 'Log in' },
                  { value: 'signup', label: 'Sign up' },
                ]}
              />
              <TabPanel tabsId="auth" value={tab} current={tab} className={styles.panel}>
                <form className={s.stack16} onSubmit={submit} noValidate>
                  {tab === 'login' ? (
                    <>
                      {emailField}
                      <Button type="submit" fullWidth loading={busy === 'email'} disabled={busy === 'google'}>
                        Log in
                      </Button>
                      <TextDivider />
                      <Button variant="outlined" fullWidth endIcon={googleIcon} loading={busy === 'google'} disabled={busy === 'email'} onClick={google}>
                        Login with Google
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" fullWidth endIcon={googleIcon} loading={busy === 'google'} disabled={busy === 'email'} onClick={google}>
                        Sign up with Google
                      </Button>
                      <TextDivider />
                      {emailField}
                      <Button type="submit" fullWidth loading={busy === 'email'} disabled={busy === 'google'}>
                        Sign up
                      </Button>
                    </>
                  )}
                </form>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
