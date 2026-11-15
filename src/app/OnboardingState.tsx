import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/** Everything the tester types during onboarding. Kept in this browser tab only (sessionStorage). */
export interface OnboardingData {
  mode: 'login' | 'signup';
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  area: string;
  radiusKm: number;
  pace: string;
  distance: string;
  reasons: string[];
  allowLocation: boolean;
  allowNotifications: boolean;
}

export const EMPTY: OnboardingData = {
  mode: 'login',
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
  area: '',
  radiusKm: 2, // Figma profile screen shows 2km selected
  pace: '',
  distance: '',
  reasons: [],
  allowLocation: true,
  allowNotifications: false,
};

const KEY = 'runion-prototype:onboarding';

function load(): OnboardingData {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<OnboardingData>) } : EMPTY;
  } catch {
    return EMPTY; // storage blocked (private mode etc.): start fresh
  }
}

interface Ctx {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  reset: () => void;
  /** Profile photo lives in memory only (object URL), never stored. */
  photo?: string;
  setPhoto: (url: string | undefined) => void;
}

const OnboardingCtx = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(load);
  const [photo, setPhoto] = useState<string>();

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: data still works for this visit */
    }
  }, [data]);

  const update = useCallback((patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch })), []);
  const reset = useCallback(() => {
    setData(EMPTY);
    setPhoto(undefined);
  }, []);

  return <OnboardingCtx.Provider value={{ data, update, reset, photo, setPhoto }}>{children}</OnboardingCtx.Provider>;
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return ctx;
}
