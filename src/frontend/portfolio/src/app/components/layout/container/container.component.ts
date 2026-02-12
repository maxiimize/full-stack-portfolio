import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Max-width container with responsive horizontal padding.
 *
 * Usage:
 *   <app-container>…</app-container>
 *   <app-container maxWidth="narrow">…</app-container>
 *   <app-container [centered]="false">…</app-container>
 */
@Component({
  selector: 'app-container',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      [ngClass]="[
        'w-full',
        'px-4 sm:px-6 lg:px-8',
        centered() ? 'mx-auto' : '',
        maxWidthClass()
      ]"
    >
      <ng-content />
    </div>
  `,
})
export class ContainerComponent {
  /** Controls the max-width breakpoint. */
  readonly maxWidth = input<'narrow' | 'default' | 'wide' | 'full'>('default');

  /** Whether the container is horizontally centered. */
  readonly centered = input(true);

  protected maxWidthClass(): string {
    switch (this.maxWidth()) {
      case 'narrow':
        return 'max-w-3xl';
      case 'default':
        return 'max-w-7xl';
      case 'wide':
        return 'max-w-screen-2xl';
      case 'full':
        return 'max-w-full';
    }
  }
}
