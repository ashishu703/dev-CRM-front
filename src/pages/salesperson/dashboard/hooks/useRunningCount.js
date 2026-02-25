import { useState, useEffect, useRef } from 'react';

const DURATION_MS = 600;

/**
 * Animates a number from current to target (running count effect).
 * @param {number} target - Target value
 * @param {boolean} [enabled=true] - Whether to animate
 * @returns {number} Current displayed value (animating toward target)
 */
export function useRunningCount(target, enabled = true) {
  const [display, setDisplay] = useState(0);
  const prevTargetRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const t = Number(target);
    const numTarget = Number.isFinite(t) ? Math.max(0, t) : 0;

    if (!enabled) {
      setDisplay(numTarget);
      prevTargetRef.current = numTarget;
      return;
    }

    const startVal = prevTargetRef.current;
    if (startVal === numTarget) return;

    startRef.current = startVal;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startVal + (numTarget - startVal) * easeOut);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevTargetRef.current = numTarget;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled]);

  return display;
}
