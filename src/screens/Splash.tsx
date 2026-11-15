import { useEffect, useState } from 'react';
import { Logo } from '../components/Logo/Logo';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { navigate } from '../app/router';
import s from './Screen.module.css';
import styles from './Splash.module.css';

const FULL_MS = 1200; // full logo on screen
const NEXT_MS = 2400; // then the intro slides

/** Figma "↳ Intro": the full logo turns into the short logo, then the intro slides start. Tap to skip. */
export function Splash() {
  const [phase, setPhase] = useState<'full' | 'short'>('full');

  useEffect(() => {
    const a = window.setTimeout(() => setPhase('short'), FULL_MS);
    const b = window.setTimeout(() => navigate('/intro/1', { replace: true }), NEXT_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    <div className={s.screen}>
      <ScreenBackground variant="slide1" />
      <button type="button" className={styles.tap} onClick={() => navigate('/intro/1', { replace: true })} aria-label="Runion. Tap to continue">
        <span className={styles.logo} data-phase={phase}>
          <Logo variant={phase} height={57} />
        </span>
      </button>
    </div>
  );
}
