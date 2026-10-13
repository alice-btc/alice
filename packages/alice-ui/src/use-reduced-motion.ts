import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Whether the person asked their system to reduce motion. On the web this is
 * the `prefers-reduced-motion` media query; on Android and iOS it is the
 * accessibility setting. Callers turn a 900 ms fill into an instant one and
 * a typewriter into plain text; nothing else about the screen changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const query = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : undefined;
      if (!query) return;
      const update = () => setReduced(query.matches);
      update();
      query.addEventListener('change', update);
      return () => query.removeEventListener('change', update);
    }
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);
  return reduced;
}
