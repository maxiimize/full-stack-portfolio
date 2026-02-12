/**
 * Global animation timing system.
 *
 * Centralizes easing curves and durations so every motion
 * in the app feels coherent. Import these constants instead
 * of hard-coding strings in individual triggers.
 */

// ── Easing curves ──────────────────────────────────────
export const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)';
export const EASE_IN = 'cubic-bezier(0.4, 0.0, 1, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const EASE_DECELERATE = 'cubic-bezier(0.0, 0.0, 0.2, 1)';

// ── Durations (ms) ─────────────────────────────────────
export const DURATION_FAST = 150;
export const DURATION_MEDIUM = 250;
export const DURATION_SLOW = 400;
export const DURATION_ENTRANCE = 500;

// ── Pre-composed timing strings for Angular animate() ──
export const TIMING_FAST = `${DURATION_FAST}ms ${EASE_OUT}`;
export const TIMING_MEDIUM = `${DURATION_MEDIUM}ms ${EASE_OUT}`;
export const TIMING_SLOW = `${DURATION_SLOW}ms ${EASE_OUT}`;
export const TIMING_ENTRANCE = `${DURATION_ENTRANCE}ms ${EASE_DECELERATE}`;
export const TIMING_EXIT = `${DURATION_MEDIUM}ms ${EASE_IN}`;
export const TIMING_SPRING = `${DURATION_ENTRANCE}ms ${EASE_SPRING}`;

// ── Stagger delay increment ────────────────────────────
export const STAGGER_DELAY = 60; // ms between siblings
