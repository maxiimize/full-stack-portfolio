import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, SkeletonCardComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private readonly projectService: ProjectService) {}

  resolveUrl(url: string): string {
    return this.projectService.resolveScreenshotUrl(url);
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
