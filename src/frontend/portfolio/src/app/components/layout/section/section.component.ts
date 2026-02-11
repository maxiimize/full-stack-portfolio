import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Vertical section with consistent spacing and optional centering.
 *
 * Usage:
 *   <app-section>…</app-section>
 *   <app-section spacing="lg" textAlign="center">…</app-section>
 */
@Component({
  selector: 'app-section',
  standalone: true,
  imports: [NgClass],
  template: `
    <section
      [ngClass]="[
        spacingClass(),
        textAlignClass()
      ]"
    >
      <ng-content />
    </section>
  `,
})
export class SectionComponent {
  /** Vertical padding applied to the section. */
  readonly spacing = input<'none' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Text alignment within the section. */
  readonly textAlign = input<'left' | 'center' | 'right'>('left');

  protected spacingClass(): string {
    const map: Record<string, string> = {
      none: '',
      sm: 'py-4 sm:py-6',
      md: 'py-8 sm:py-12',
      lg: 'py-12 sm:py-16 lg:py-20',
      xl: 'py-16 sm:py-20 lg:py-24',
    };
    return map[this.spacing()] ?? 'py-8 sm:py-12';
  }

  protected textAlignClass(): string {
    const map: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return map[this.textAlign()] ?? 'text-left';
  }
}
