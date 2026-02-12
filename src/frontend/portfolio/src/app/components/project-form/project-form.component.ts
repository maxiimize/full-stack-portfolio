import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import {
  CreateProjectRequest,
  Project,
  Screenshot,
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

  /** Screenshots already saved on the server */
  screenshots = signal<Screenshot[]>([]);
  /** Tracks files queued for upload (create mode or adding to existing project) */
  pendingFiles: { file: File; altText: string; preview: string }[] = [];
  uploadingScreenshot = signal(false);

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
        this.screenshots.set(project.screenshots);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load project.');
        this.loading.set(false);
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Screenshot management                                              */
  /* ------------------------------------------------------------------ */

  resolveUrl(url: string): string {
    return this.projectService.resolveScreenshotUrl(url);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (const file of Array.from(input.files)) {
      if (!file.type.startsWith('image/')) continue;
      this.pendingFiles.push({
        file,
        altText: '',
        preview: URL.createObjectURL(file),
      });
    }

    // Reset input so the same file can be selected again
    input.value = '';
  }

  removePendingFile(index: number): void {
    URL.revokeObjectURL(this.pendingFiles[index].preview);
    this.pendingFiles.splice(index, 1);
  }

  /** Upload all pending files (used in edit mode, so each goes straight to the server) */
  async uploadPendingFiles(): Promise<void> {
    if (this.pendingFiles.length === 0) return;
    this.uploadingScreenshot.set(true);

    const currentCount = this.screenshots().length;

    for (let i = 0; i < this.pendingFiles.length; i++) {
      const pending = this.pendingFiles[i];
      try {
        const screenshot = await this.projectService
          .uploadScreenshot(this.projectId!, pending.file, pending.altText || undefined, currentCount + i)
          .toPromise();
        if (screenshot) {
          this.screenshots.update((list) => [...list, screenshot]);
        }
      } catch {
        this.errorMessage.set(`Failed to upload "${pending.file.name}".`);
      }
    }

    // Clean up previews
    this.pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
    this.pendingFiles = [];
    this.uploadingScreenshot.set(false);
  }

  removeScreenshot(screenshot: Screenshot): void {
    if (!screenshot.id || !this.projectId) return;

    this.projectService.deleteScreenshot(this.projectId, screenshot.id).subscribe({
      next: () => {
        this.screenshots.update((list) => list.filter((s) => s !== screenshot));
      },
      error: () => {
        this.errorMessage.set('Failed to delete screenshot.');
      },
    });
  }

  moveScreenshot(index: number, direction: -1 | 1): void {
    const list = [...this.screenshots()];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap
    [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
    // Update sort orders
    list.forEach((s, i) => (s.sortOrder = i));
    this.screenshots.set(list);

    // Persist reorder if in edit mode
    if (this.projectId) {
      const ids = list.map((s) => s.id!);
      this.projectService.reorderScreenshots(this.projectId, ids).subscribe({
        error: () => this.errorMessage.set('Failed to reorder screenshots.'),
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Submit (create or update)                                          */
  /* ------------------------------------------------------------------ */

  onSubmit(): void {
    if (this.isEditMode && !confirm('Save changes to this project?')) {
      return;
    }

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
        screenshots: this.screenshots(),
      };

      this.projectService.update(this.projectId!, request).subscribe({
        next: () => {
          this.saving.set(false);
          // Also upload any pending files after the update
          if (this.pendingFiles.length > 0) {
            this.uploadPendingFiles();
          }
          this.successMessage.set('Project updated successfully.');
          // Scroll to top so the user sees the success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
        next: (project) => {
          this.saving.set(false);
          // Upload pending files for the newly created project
          if (this.pendingFiles.length > 0) {
            this.projectId = project.id;
            this.uploadPendingFiles().then(() => {
              this.router.navigate(['/admin']);
            });
          } else {
            this.router.navigate(['/admin']);
          }
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
