import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'portfolio-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Current theme as a reactive signal. */
  readonly theme = signal<Theme>(this.loadTheme());

  constructor() {
    // Apply the persisted theme immediately and react to future changes.
    effect(() => this.applyTheme(this.theme()));
  }

  /** Toggle between dark and light themes. */
  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  /** Returns true when the current theme is dark. */
  isDark(): boolean {
    return this.theme() === 'dark';
  }

  // ── Private helpers ──────────────────────────────────

  private loadTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark'; // default
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;

    // Enable transition class so the swap animates smoothly.
    body.classList.add('theme-transition');

    if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }

    localStorage.setItem(STORAGE_KEY, theme);

    // Remove the transition class after the animation completes
    // to avoid interfering with other transitions.
    setTimeout(() => body.classList.remove('theme-transition'), 350);
  }
}
