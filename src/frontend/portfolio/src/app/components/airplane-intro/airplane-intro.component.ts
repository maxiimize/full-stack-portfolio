import {
  Component,
  output,
  signal,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';

interface Particle {
  id: number;
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  opacity: string;
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

  protected readonly phase = signal<'entering' | 'revealed' | 'exiting' | 'done'>('entering');
  protected readonly particles: Particle[] = this.generateParticles(45);

  constructor() {
    afterNextRender(() => {
      // All content fully visible
      setTimeout(() => this.phase.set('revealed'), 2600);
      // Begin exit transition
      setTimeout(() => this.phase.set('exiting'), 3200);
      // Remove from DOM
      setTimeout(() => {
        this.phase.set('done');
        this.animationComplete.emit();
      }, 4300);
    });
  }

  // ── Helpers ──────────────────────────────────────────

  private generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 2.5}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${5 + Math.random() * 8}s`,
      opacity: `${0.12 + Math.random() * 0.4}`,
      drift: `${-25 - Math.random() * 45}px`,
    }));
  }
}
