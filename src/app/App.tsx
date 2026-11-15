import { useEffect, useRef } from 'react';
import { Gallery } from '../gallery/Gallery';
import { AllSet } from '../screens/AllSet';
import { Auth } from '../screens/Auth';
import { Home } from '../screens/Home';
import { Intro } from '../screens/Intro';
import { Profile } from '../screens/Profile';
import { Splash } from '../screens/Splash';
import { Verify } from '../screens/Verify';
import { OnboardingProvider } from './OnboardingState';
import { navigate, useRoute } from './router';
import styles from './App.module.css';

/** Maps a route to a screen. Unknown routes go back to the splash. */
function Screen({ route }: { route: string }) {
  const [, section, param] = route.split('/');
  switch (section) {
    case '':
    case undefined:
      return <Splash />;
    case 'intro':
      return <Intro index={clamp(Number(param) - 1, 0, 2)} />;
    case 'auth':
      return <Auth tab={param === 'signup' ? 'signup' : 'login'} />;
    case 'verify':
      return <Verify />;
    case 'profile':
      return <Profile step={clamp(Number(param) - 1, 0, 3)} />;
    case 'done':
      return <AllSet />;
    case 'home':
      return <Home />;
    default:
      return <Redirect to="/" />;
  }
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

const clamp = (n: number, min: number, max: number) => (Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);

export function App() {
  const route = useRoute();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Each new screen starts at the top, and focus moves to it for keyboard and screen-reader users.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.focus({ preventScroll: true });
  }, [route]);

  if (route === '/gallery') return <Gallery />;

  return (
    <OnboardingProvider>
      <div className={styles.stage}>
        <div className={styles.device}>
          <div ref={scrollRef} className={styles.scroll} tabIndex={-1}>
            <Screen route={route} />
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
}
