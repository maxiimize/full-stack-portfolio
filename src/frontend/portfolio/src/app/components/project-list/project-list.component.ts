import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';
import { ScrollFadeDirective } from '../../shared';
import { staggerList, fadeSlide } from '../../animations';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, SkeletonCardComponent, ScrollFadeDirective],
  animations: [staggerList, fadeSlide],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Tracks the active screenshot index per project id */
  activeScreenshot: Record<number, number> = {};

  constructor(private readonly projectService: ProjectService) {}

  scrollToProjects(): void {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }

  resolveUrl(url: string): string {
    return this.projectService.resolveScreenshotUrl(url);
  }

  getActiveIndex(projectId: number): number {
    return this.activeScreenshot[projectId] ?? 0;
  }

  prevScreenshot(projectId: number, total: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getActiveIndex(projectId);
    this.activeScreenshot[projectId] = current > 0 ? current - 1 : total - 1;
  }

  nextScreenshot(projectId: number, total: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getActiveIndex(projectId);
    this.activeScreenshot[projectId] = current < total - 1 ? current + 1 : 0;
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getAll().subscribe({
      next: (result) => {
        this.projects.set(result.items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load projects. Please try again later.');
        this.loading.set(false);
        console.error('Error loading projects:', err);
      },
    });
  }
}
