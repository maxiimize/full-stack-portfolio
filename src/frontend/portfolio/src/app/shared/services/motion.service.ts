import { Injectable, signal } from '@angular/core';

/**
 * Detects and exposes the user's reduced-motion preference.
 *
 * Components and directives should check `this.motionService.prefersReducedMotion()`
 * before triggering complex animations.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly prefersReducedMotion = signal(this.query());

  constructor() {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      mql.addEventListener('change', (e) => this.prefersReducedMotion.set(e.matches));
    }
  }

  private query(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
