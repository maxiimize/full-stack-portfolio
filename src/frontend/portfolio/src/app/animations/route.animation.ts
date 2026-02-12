/**
 * Route transition animation.
 *
 * Applies a fade + slight slide-up when navigating between routes.
 * Attach `[@routeAnimation]="outlet"` on the `<router-outlet>` wrapper.
 *
 * Usage in component:
 *   imports: [RouterOutlet],
 *   animations: [routeAnimation],
 *   template: `
 *     <div [@routeAnimation]="getRouteAnimationData(outlet)">
 *       <router-outlet #outlet="outlet" />
 *     </div>
 *   `
 */
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
  AnimationTriggerMetadata,
} from '@angular/animations';

import { TIMING_MEDIUM, TIMING_ENTRANCE, EASE_OUT, DURATION_MEDIUM } from './timings';

export const routeAnimation: AnimationTriggerMetadata = trigger('routeAnimation', [
  transition('* <=> *', [
    // Set both entering and leaving views to position absolute
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),

    group([
      // Leaving view fades out with slight upward movement
      query(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate(
          `${DURATION_MEDIUM}ms ${EASE_OUT}`,
          style({ opacity: 0, transform: 'translateY(-12px)' }),
        ),
      ], { optional: true }),

      // Entering view fades in from below
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate(
          TIMING_ENTRANCE,
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ], { optional: true }),
    ]),
  ]),
]);
