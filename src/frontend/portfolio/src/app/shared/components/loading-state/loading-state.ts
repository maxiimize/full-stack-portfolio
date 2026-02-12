import { Component, input } from '@angular/core';
import { fadeSlide } from '../../../animations';

/**
 * Reusable loading / empty / error state component.
 *
 * Usage:
 *   <app-loading-state [loading]="true" />
 *   <app-loading-state [empty]="true" emptyText="No projects yet" />
 *   <app-loading-state [error]="'Something went wrong'" />
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  animations: [fadeSlide],
  template: `
    @if (loading()) {
      <div class="state-container" @fadeSlide>
        <div class="state-spinner">
          <div class="spinner"></div>
        </div>
        <p class="state-subtext">{{ loadingText() }}</p>
      </div>
    }

    @if (!loading() && error()) {
      <div class="state-container state-container--error" @fadeSlide>
        <div class="state-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               stroke-linejoin="round" width="48" height="48">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="state-text state-text--error">{{ error() }}</p>
        <ng-content select="[actions]" />
      </div>
    }

    @if (!loading() && !error() && empty()) {
      <div class="state-container" @fadeSlide>
        <div class="state-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               stroke-linejoin="round" width="48" height="48">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
        </div>
        <p class="state-text">{{ emptyText() }}</p>
        <p class="state-subtext">{{ emptySubtext() }}</p>
        <ng-content select="[actions]" />
      </div>
    }
  `,
  styleUrl: './loading-state.component.css',
})
export class LoadingStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly empty = input(false);
  readonly loadingText = input('Loading…');
  readonly emptyText = input('Nothing here yet');
  readonly emptySubtext = input('');
}
