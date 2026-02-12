import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  OnDestroy,
  Renderer2,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../services/motion.service';

/**
 * Lightweight scroll-based fade-in directive using IntersectionObserver.
 *
 * Usage:
 *   <div appScrollFade>…</div>
 *   <div appScrollFade [scrollFadeDirection]="'up'" [scrollFadeDelay]="200">…</div>
 *
 * The element starts invisible and animates in when scrolled into view.
 * Automatically skipped when the user prefers reduced motion.
 */
@Directive({
  selector: '[appScrollFade]',
  standalone: true,
})
export class ScrollFadeDirective implements OnInit, OnDestroy {
  /** Direction the element slides from: 'up' | 'down' | 'left' | 'right' | 'none' */
  readonly scrollFadeDirection = input<'up' | 'down' | 'left' | 'right' | 'none'>('up');

  /** Extra delay in ms before the animation plays. */
  readonly scrollFadeDelay = input(0);

  /** IntersectionObserver threshold (0–1). */
  readonly scrollFadeThreshold = input(0.15);

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly motionService = inject(MotionService);
  private readonly platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Skip animation entirely for reduced motion
    if (this.motionService.prefersReducedMotion()) {
      return;
    }

    const el = this.el.nativeElement as HTMLElement;

    // Set initial hidden state via CSS classes
    this.renderer.addClass(el, 'scroll-fade');
    this.renderer.addClass(el, `scroll-fade--${this.scrollFadeDirection()}`);

    if (this.scrollFadeDelay() > 0) {
      this.renderer.setStyle(el, 'transitionDelay', `${this.scrollFadeDelay()}ms`);
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'scroll-fade--visible');
            this.observer?.unobserve(entry.target); // one-shot
          }
        }
      },
      { threshold: this.scrollFadeThreshold() },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
