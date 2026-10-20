import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  fillDemo(role: 'owner' | 'guest'): void {
    if (role === 'owner') {
      this.form.setValue({ email: 'owner@securepg.local', password: 'Owner@Secure123' });
    } else {
      this.form.setValue({ email: 'guest@securepg.local', password: 'Guest@Secure123' });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.api.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.auth.setSession(res.accessToken, res.role, res.email);
        void this.router.navigate([res.role === 'OWNER' ? '/owner' : '/guest']);
      },
      error: () => {
        this.error.set('Invalid credentials or the account is unavailable.');
        this.loading.set(false);
      }
    });
  }
}
