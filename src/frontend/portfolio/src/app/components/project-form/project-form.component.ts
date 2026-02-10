import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit {
  /** null → create mode, number → edit mode */
  projectId: number | null = null;

  title = '';
  description = '';
  liveUrl = '';
  sourceUrl = '';
  tagsInput = '';

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  get isEditMode(): boolean {
    return this.projectId !== null;
  }

  get heading(): string {
    return this.isEditMode ? 'Edit Project' : 'New Project';
  }

  constructor(
    private readonly projectService: ProjectService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId = Number(idParam);
      this.loadProject(this.projectId);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Load existing project for editing                                  */
  /* ------------------------------------------------------------------ */

  private loadProject(id: number): void {
    this.loading.set(true);
    this.projectService.getById(id).subscribe({
      next: (project: Project) => {
        this.title = project.title;
        this.description = project.description;
        this.liveUrl = project.liveUrl ?? '';
        this.sourceUrl = project.sourceUrl ?? '';
        this.tagsInput = project.tags.join(', ');
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load project.');
        this.loading.set(false);
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Submit (create or update)                                          */
  /* ------------------------------------------------------------------ */

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.saving.set(true);

    const tags = this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (this.isEditMode) {
      const request: UpdateProjectRequest = {
        title: this.title,
        description: this.description,
        liveUrl: this.liveUrl || null,
        sourceUrl: this.sourceUrl || null,
        tags,
        screenshots: [],
      };

      this.projectService.update(this.projectId!, request).subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Project updated successfully.');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(
            err.error?.message ?? 'Failed to update project.',
          );
        },
      });
    } else {
      const request: CreateProjectRequest = {
        title: this.title,
        description: this.description,
        liveUrl: this.liveUrl || null,
        sourceUrl: this.sourceUrl || null,
        tags,
        screenshots: [],
      };

      this.projectService.create(request).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(
            err.error?.message ?? 'Failed to create project.',
          );
        },
      });
    }
  }
}
