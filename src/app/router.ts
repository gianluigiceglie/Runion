import { useSyncExternalStore } from 'react';

/**
 * Minimal hash router for the prototype: routes look like "#/profile/2".
 * Hash URLs work from any static host and survive reloads, with no server config.
 */
const read = () => window.location.hash.replace(/^#/, '') || '/';

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): string {
  return useSyncExternalStore(subscribe, read, () => '/');
}

/** Go to a route. `replace` swaps the current history entry (no extra Back step). */
export function navigate(path: string, { replace = false }: { replace?: boolean } = {}) {
  if (read() === path) return;
  if (replace) {
    window.history.replaceState(null, '', `#${path}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}
