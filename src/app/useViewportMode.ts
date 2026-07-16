import { useSyncExternalStore } from 'react';

/**
 * Layout modes adapt to the live viewport (resize, rotation, split-screen),
 * which user-agent device detection cannot do reliably. Keep this media query
 * in sync with the compact-mode breakpoint in `src/styles/layout.css`.
 */
export const COMPACT_VIEWPORT_QUERY = '(max-width: 900px)';

export type ViewportMode = 'compact' | 'expanded';

function subscribe(onChange: () => void): () => void {
  const mediaQueryList = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  mediaQueryList.addEventListener('change', onChange);
  return () => mediaQueryList.removeEventListener('change', onChange);
}

function getSnapshot(): ViewportMode {
  return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches ? 'compact' : 'expanded';
}

export function useViewportMode(): ViewportMode {
  return useSyncExternalStore(subscribe, getSnapshot);
}
