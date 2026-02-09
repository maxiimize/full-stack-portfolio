import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResult, Project } from '../models/project.model';

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
}
