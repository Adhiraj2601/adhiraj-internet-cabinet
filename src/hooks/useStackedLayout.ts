import { useState, useEffect } from 'react';

/**
 * Single source of truth media query for the stacked hero layout.
 * Matches all phones (< 768px) and all portrait devices (e.g. iPad Mini, Surface Pro, iPad Pro).
 * Any landscape viewport >= 768px (e.g. 1024x768, 1280x800, laptops) gets the 2-column desktop layout.
 */
export const STACKED_MEDIA_QUERY = '(max-width: 767px), (orientation: portrait)';

export function checkIsStackedLayout(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(STACKED_MEDIA_QUERY).matches;
}

export function useStackedLayout(): boolean {
  const [isStacked, setIsStacked] = useState(() => checkIsStackedLayout());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(STACKED_MEDIA_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      setIsStacked(e.matches);
    };

    setIsStacked(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isStacked;
}
