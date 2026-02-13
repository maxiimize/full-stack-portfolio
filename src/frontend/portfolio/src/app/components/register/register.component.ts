import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { scaleIn, fadeSlide } from '../../animations';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  animations: [scaleIn, fadeSlide],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (!this.passwordsMatch) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    const request: RegisterRequest = {
      userName: this.userName,
      email: this.email,
      password: this.password,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  private extractError(err: any): string {
    const body = err.error;
    if (!body) return 'Registration failed. Please try again.';
    if (typeof body === 'string') return body;
    if (body.title && body.errors) {
      const messages = Object.values<string[]>(body.errors).flat();
      return messages.join(' ');
    }
    return body.message ?? body.title ?? 'Registration failed. Please try again.';
  }
}
