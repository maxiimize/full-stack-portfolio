import { Component, input } from '@angular/core';
import { fadeSlide } from '../../../animations';

/**
 * Reusable loading / empty / error state component with smooth fade transitions.
 *
 * Usage:
 *   <app-loading-state [loading]="loading()" [error]="error()" emptyMessage="No items found">
 *     <!-- content shown when not loading, no error, and not empty -->
 *   </app-loading-state>
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  animations: [fadeSlide],
  template: `
    @if (loading()) {
      <div class="state-container" @fadeSlide>
        <div class="state-spinner" aria-label="Loading">
          <div class="spinner"></div>
        </div>
        <p class="state-text">{{ loadingMessage() }}</p>
      </div>
    } @else if (error()) {
      <div class="state-container state-container--error" @fadeSlide>
        <div class="state-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               stroke-linejoin="round" width="40" height="40">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="state-text state-text--error">{{ error() }}</p>
        <ng-content select="[retryAction]" />
      </div>
    } @else if (empty()) {
      <div class="state-container state-container--empty" @fadeSlide>
        <div class="state-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               stroke-linejoin="round" width="40" height="40">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
        </div>
        <p class="state-text">{{ emptyMessage() }}</p>
        <p class="state-subtext">{{ emptySubtext() }}</p>
        <ng-content select="[emptyAction]" />
      </div>
    } @else {
      <ng-content />
    }
  `,
  styleUrl: './loading-state.component.css',
})
export class LoadingStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly empty = input(false);
  readonly loadingMessage = input('Loading…');
  readonly emptyMessage = input('Nothing here yet');
  readonly emptySubtext = input('Check back soon.');
}
