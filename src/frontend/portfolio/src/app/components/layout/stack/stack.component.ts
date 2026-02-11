import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Flexbox stack (vertical or horizontal) with consistent gap spacing.
 *
 * Usage:
 *   <app-stack>…</app-stack>
 *   <app-stack direction="row" gap="lg" align="center">…</app-stack>
 */
@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      [ngClass]="[
        'flex',
        directionClass(),
        gapClass(),
        alignClass(),
        justifyClass(),
        wrap() ? 'flex-wrap' : ''
      ]"
    >
      <ng-content />
    </div>
  `,
})
export class StackComponent {
  /** Stack direction. */
  readonly direction = input<'column' | 'row'>('column');

  /** Gap between items. */
  readonly gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Cross-axis alignment. */
  readonly align = input<'start' | 'center' | 'end' | 'stretch' | 'baseline'>('stretch');

  /** Main-axis alignment. */
  readonly justify = input<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>('start');

  /** Whether items can wrap. */
  readonly wrap = input(false);

  protected directionClass(): string {
    return this.direction() === 'row' ? 'flex-row' : 'flex-col';
  }

  protected gapClass(): string {
    const map: Record<string, string> = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };
    return map[this.gap()] ?? 'gap-4';
  }

  protected alignClass(): string {
    const map: Record<string, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };
    return map[this.align()] ?? 'items-stretch';
  }

  protected justifyClass(): string {
    const map: Record<string, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };
    return map[this.justify()] ?? 'justify-start';
  }
}
