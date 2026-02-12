export interface Screenshot {
  id?: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  liveUrl: string | null;
  sourceUrl: string | null;
  createdAt: string;
  tags: string[];
  screenshots: Screenshot[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  liveUrl?: string | null;
  sourceUrl?: string | null;
  tags: string[];
  screenshots: Screenshot[];
}

export interface UpdateProjectRequest {
  title: string;
  description: string;
  liveUrl?: string | null;
  sourceUrl?: string | null;
  tags: string[];
  screenshots: Screenshot[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
