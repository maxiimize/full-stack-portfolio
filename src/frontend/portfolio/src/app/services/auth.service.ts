import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const EXPIRATION_KEY = 'auth_expiration';
const ROLE_KEY = 'auth_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(this.getStoredToken());

  /** Reactive flag – true when a non-expired token is present. */
  readonly isLoggedIn = computed(() => {
    const token = this._token();
    if (!token) return false;
    const expiration = localStorage.getItem(EXPIRATION_KEY);
    if (!expiration) return false;
    return new Date(expiration) > new Date();
  });

  /** Current user role (empty string when not authenticated). */
  readonly role = computed(() =>
    this.isLoggedIn() ? (localStorage.getItem(ROLE_KEY) ?? '') : ''
  );

  /** Convenience accessor used by the interceptor. */
  get token(): string | null {
    return this._token();
  }

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
    localStorage.removeItem(ROLE_KEY);
    this._token.set(null);
  }

  /* ------------------------------------------------------------------ */

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(EXPIRATION_KEY, response.expiration);
    localStorage.setItem(ROLE_KEY, response.role);
    this._token.set(response.token);
  }

  private getStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiration = localStorage.getItem(EXPIRATION_KEY);
    if (token && expiration && new Date(expiration) > new Date()) {
      return token;
    }
    return null;
  }
}
