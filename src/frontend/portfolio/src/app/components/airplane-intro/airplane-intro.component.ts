import {
  Component,
  output,
  signal,
  computed,
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

interface SmokePuff {
  id: number;
  left: string;
  top: string;
  delay: string;
  size: string;
  opacity: string;
  driftX: string;
  driftY: string;
  duration: string;
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

  protected readonly phase = signal<'playing' | 'revealed' | 'exiting' | 'done'>('playing');
  protected readonly flightPath = signal<string>('');
  protected readonly stars: Star[] = this.generateStars(50);
  protected readonly smokePuffs: SmokePuff[] = this.generateSmokePuffs(45);

  /**
   * CSS `offset-path` binding for the airplane element.
   * Horizontal flight path computed in real viewport pixels.
   */
  protected readonly airplaneOffsetPath = computed(() => {
    const p = this.flightPath();
    return p ? `path('${p}')` : 'none';
  });

  constructor() {
    afterNextRender(() => {
      this.computeFlightPath();

      // Name fully revealed & sharpened
      setTimeout(() => this.phase.set('revealed'), 2800);
      // Begin exit fade
      setTimeout(() => this.phase.set('exiting'), 3800);
      // Fully done — remove from DOM
      setTimeout(() => {
        this.phase.set('done');
        this.animationComplete.emit();
      }, 4900);
    });
  }

  /**
   * Compute a nearly-horizontal flight path at ~42% from the top,
   * matching the vertical center of "MAX BERRIDGE" in the intro layout.
   * A very gentle S-curve keeps it dynamic without looking diagonal.
   */
  private computeFlightPath(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const y = vh * 0.50;          // vertical center of the name area
    const sag = vh * 0.008;       // ±0.8% gentle curve

    this.flightPath.set(
      `M ${-180} ${y} C ${vw * 0.3} ${y + sag}, ${vw * 0.7} ${y - sag}, ${vw + 180} ${y}`
    );
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

  /**
   * Generate smoke puffs scattered around the horizontal flight line.
   * They appear staggered left-to-right, timed with the airplane.
   */
  private generateSmokePuffs(count: number): SmokePuff[] {
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;                   // 0→1 left to right
      const xJitter = (Math.random() - 0.5) * 6;     // ±3%
      const yJitter = (Math.random() - 0.5) * 10;    // ±5%
      return {
        id: i,
        left: `${t * 88 + 6 + xJitter}%`,            // 6–94% of viewport
        top: `${50 + yJitter}%`,                       // ~50% from top (around name)
        delay: `${0.3 + t * 2.6}s`,                   // follow the airplane
        size: `${22 + Math.random() * 55}px`,
        opacity: `${0.08 + Math.random() * 0.18}`,
        driftX: `${(Math.random() - 0.5) * 35}px`,
        driftY: `${-8 - Math.random() * 28}px`,       // drift upward
        duration: `${2 + Math.random() * 1.2}s`,
      };
    });
  }
}
