import { Button } from '../components/Button/Button';
import { Logo } from '../components/Logo/Logo';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { useOnboarding } from '../app/OnboardingState';
import { navigate } from '../app/router';
import s from './Screen.module.css';
import styles from './Home.module.css';

/**
 * Placeholder for the screen after log in (not in Figma yet; the design will replace this).
 * "Log out" clears the prototype data and goes back to the Log in tab.
 */
export function Home() {
  const { data, reset } = useOnboarding();

  return (
    <div className={s.screen}>
      <ScreenBackground variant="firstLevel" />
      <div className={s.body}>
        <div className={s.center}>
          <div className={styles.content}>
            <Logo variant="short" height={57} />
            <h1 className={`text-h2 ${s.h2}`}>Home</h1>
            <p className={`text-body-md-regular ${s.lead}`}>Placeholder: the home design is coming soon.</p>
            {data.email && (
              <p className={`text-body-sm-regular ${s.lead} ${styles.muted}`}>
                Logged in as <span className="text-body-sm-semi-bold">{data.email}</span>
              </p>
            )}
          </div>
        </div>
        <div className={s.footer}>
          <Button
            variant="outlined"
            onClick={() => {
              reset();
              navigate('/auth/login', { replace: true });
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
