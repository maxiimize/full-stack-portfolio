import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateProjectRequest,
  PagedResult,
  Project,
  Screenshot,
  UpdateProjectRequest,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  getAll(page = 1, pageSize = 10, tag?: string): Observable<PagedResult<Project>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (tag) {
      params = params.set('tag', tag);
    }

    return this.http.get<PagedResult<Project>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, request);
  }

  update(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadScreenshot(projectId: number, file: File, altText?: string, sortOrder = 0): Observable<Screenshot> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }
    formData.append('sortOrder', sortOrder.toString());
    return this.http.post<Screenshot>(`${this.apiUrl}/${projectId}/screenshots`, formData);
  }

  deleteScreenshot(projectId: number, screenshotId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/screenshots/${screenshotId}`);
  }

  reorderScreenshots(projectId: number, screenshotIds: number[]): Observable<Screenshot[]> {
    return this.http.put<Screenshot[]>(`${this.apiUrl}/${projectId}/screenshots/reorder`, screenshotIds);
  }

  /** Resolve a screenshot's relative URL to an absolute URL. */
  resolveScreenshotUrl(relativeUrl: string): string {
    return `${environment.baseUrl}${relativeUrl}`;
  }
}
