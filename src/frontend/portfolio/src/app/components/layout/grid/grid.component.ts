import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Responsive CSS-grid wrapper.
 *
 * Usage:
 *   <app-grid>…</app-grid>
 *   <app-grid columns="4" gap="lg">…</app-grid>
 *   <app-grid columns="auto-fill" minChildWidth="280px">…</app-grid>
 */
@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (columns() === 'auto-fill' || columns() === 'auto-fit') {
      <div
        class="grid"
        [ngClass]="gapClass()"
        [style.gridTemplateColumns]="'repeat(' + columns() + ', minmax(' + minChildWidth() + ', 1fr))'"
      >
        <ng-content />
      </div>
    } @else {
      <div
        class="grid"
        [ngClass]="[columnsClass(), gapClass()]"
      >
        <ng-content />
      </div>
    }
  `,
})
export class GridComponent {
  /**
   * Number of columns (1–6), or 'auto-fill' / 'auto-fit' for intrinsic sizing.
   * Responsive: on mobile always 1 col, sm → 2, then the target at md+.
   */
  readonly columns = input<'1' | '2' | '3' | '4' | '5' | '6' | 'auto-fill' | 'auto-fit'>('3');

  /** Gap between grid items. */
  readonly gap = input<'none' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Minimum child width when using auto-fill / auto-fit. */
  readonly minChildWidth = input('280px');

  protected columnsClass(): string {
    const map: Record<string, string> = {
      '1': 'grid-cols-1',
      '2': 'grid-cols-1 sm:grid-cols-2',
      '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return map[this.columns()] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }

  protected gapClass(): string {
    const map: Record<string, string> = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4 lg:gap-6',
      lg: 'gap-6 lg:gap-8',
      xl: 'gap-8 lg:gap-10',
    };
    return map[this.gap()] ?? 'gap-4 lg:gap-6';
  }
}
