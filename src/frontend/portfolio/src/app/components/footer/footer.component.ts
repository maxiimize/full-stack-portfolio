import { Component, ElementRef, OnInit, OnDestroy, signal } from '@angular/core';
import { DURATION_ENTRANCE } from '../../animations/timings';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  host: {
    '[class.visible]': 'visible()',
  },
})
export class FooterComponent implements OnInit, OnDestroy {
  protected readonly currentYear = new Date().getFullYear();
  protected readonly visible = signal(false);

  private observer: IntersectionObserver | null = null;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // Wait for the route entrance animation to finish before observing.
    // This prevents the footer from revealing while the hero content
    // is still animating in on initial page load.
    this.delayTimer = setTimeout(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.visible.set(true);
            this.observer?.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      this.observer.observe(this.el.nativeElement);
    }, DURATION_ENTRANCE);
  }

  ngOnDestroy(): void {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    this.observer?.disconnect();
  }
}
