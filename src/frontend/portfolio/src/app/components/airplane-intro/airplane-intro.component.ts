import {
  Component,
  output,
  signal,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';

interface Star {
  id: number;
  left: string;
  top: string;
  size: string;
  delay: string;
  duration: string;
  maxOpacity: string;
}

interface Particle {
  id: number;
  left: string;
  top: string;
  delay: string;
  size: string;
  drift: string;
}

@Component({
  selector: 'app-airplane-intro',
  templateUrl: './airplane-intro.component.html',
  styleUrl: './airplane-intro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirplaneIntroComponent {
  /** Emits once the full intro animation has finished. */
  readonly animationComplete = output<void>();

  protected readonly phase = signal<'playing' | 'exiting' | 'done'>('playing');
  protected readonly stars: Star[] = this.generateStars(60);
  protected readonly particles: Particle[] = this.generateParticles(26);

  constructor() {
    afterNextRender(() => {
      // Begin exit fade after airplane has crossed the screen
      setTimeout(() => this.phase.set('exiting'), 2700);
      // Fully done — remove from DOM
      setTimeout(() => {
        this.phase.set('done');
        this.animationComplete.emit();
      }, 3700);
    });
  }

  // ── Helpers ──────────────────────────────────────────

  private generateStars(count: number): Star[] {
    return Array.from({ length: count }, (_, i) => {
      const bright = Math.random() > 0.82;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: bright
          ? `${2.5 + Math.random() * 2}px`
          : `${1 + Math.random() * 1.5}px`,
        delay: `${Math.random() * 1.2}s`,
        duration: `${1.5 + Math.random() * 2}s`,
        maxOpacity: bright ? '0.9' : `${0.25 + Math.random() * 0.35}`,
      };
    });
  }

  private generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count; // avoid exact 0 / 1
      const x = this.cubic(t, -8, 20, 60, 108);
      const y = this.cubic(t, 62, 75, 20, -8);
      const yJitter = (Math.random() - 0.5) * 6;
      return {
        id: i,
        left: `${x}%`,
        top: `${y + yJitter}%`,
        delay: `${0.5 + t * 1.9}s`,
        size: `${2 + Math.random() * 3}px`,
        drift: `${-25 + Math.random() * 50}px`,
      };
    });
  }

  /** Evaluate a cubic Bézier at parameter t ∈ [0, 1]. */
  private cubic(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }
}
