/**
 * Reusable Angular animation triggers.
 *
 * Usage:
 *   @Component({
 *     animations: [fadeIn, slideUp, staggerList],
 *     template: `<div @fadeIn>…</div>`
 *   })
 */
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
  animateChild,
  group,
  AnimationTriggerMetadata,
} from '@angular/animations';

import {
  TIMING_FAST,
  TIMING_MEDIUM,
  TIMING_SLOW,
  TIMING_ENTRANCE,
  TIMING_EXIT,
  TIMING_SPRING,
  STAGGER_DELAY,
} from './timings';

// ────────────────────────────────────────────────────────
// Fade In / Out
// ────────────────────────────────────────────────────────

export const fadeIn: AnimationTriggerMetadata = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(TIMING_MEDIUM, style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate(TIMING_EXIT, style({ opacity: 0 })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Slide Up (entrance)
// ────────────────────────────────────────────────────────

export const slideUp: AnimationTriggerMetadata = trigger('slideUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate(TIMING_ENTRANCE, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate(TIMING_EXIT, style({ opacity: 0, transform: 'translateY(-8px)' })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Slide Down (entrance)
// ────────────────────────────────────────────────────────

export const slideDown: AnimationTriggerMetadata = trigger('slideDown', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-12px)' }),
    animate(TIMING_ENTRANCE, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate(TIMING_EXIT, style({ opacity: 0, transform: 'translateY(-12px)' })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Scale In (used for modals, cards)
// ────────────────────────────────────────────────────────

export const scaleIn: AnimationTriggerMetadata = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate(TIMING_ENTRANCE, style({ opacity: 1, transform: 'scale(1)' })),
  ]),
  transition(':leave', [
    animate(TIMING_EXIT, style({ opacity: 0, transform: 'scale(0.95)' })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Stagger list – use on a parent with *ngFor / @for children
//
// Template:
//   <div @staggerList>
//     @for (item of items; track item.id) {
//       <div class="stagger-item">…</div>
//     }
//   </div>
// ────────────────────────────────────────────────────────

export const staggerList: AnimationTriggerMetadata = trigger('staggerList', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(`${STAGGER_DELAY}ms`, [
          animate(TIMING_ENTRANCE, style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

// ────────────────────────────────────────────────────────
// Toast slide-in from top-right
// ────────────────────────────────────────────────────────

export const toastSlideIn: AnimationTriggerMetadata = trigger('toastSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%) translateY(-8px)' }),
    animate(TIMING_SPRING, style({ opacity: 1, transform: 'translateX(0) translateY(0)' })),
  ]),
  transition(':leave', [
    animate(TIMING_FAST, style({ opacity: 0, transform: 'translateX(100%)' })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Fade slide (for loading/empty states)
// ────────────────────────────────────────────────────────

export const fadeSlide: AnimationTriggerMetadata = trigger('fadeSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate(TIMING_MEDIUM, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate(TIMING_FAST, style({ opacity: 0, transform: 'translateY(-4px)' })),
  ]),
]);

// ────────────────────────────────────────────────────────
// Expand / Collapse (height)
// ────────────────────────────────────────────────────────

export const expandCollapse: AnimationTriggerMetadata = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
  transition('collapsed <=> expanded', animate(TIMING_MEDIUM)),
]);

// ────────────────────────────────────────────────────────
// Barrel export
// ────────────────────────────────────────────────────────

export const ALL_ANIMATIONS = [
  fadeIn,
  slideUp,
  slideDown,
  scaleIn,
  staggerList,
  toastSlideIn,
  fadeSlide,
  expandCollapse,
];
