import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  templateUrl: './skeleton-card.component.html',
  styleUrl: './skeleton-card.component.css',
})
export class SkeletonCardComponent {
  /** Number of skeleton cards to render */
  @Input() count = 3;

  get cards(): number[] {
    return Array.from({ length: this.count });
  }
}
