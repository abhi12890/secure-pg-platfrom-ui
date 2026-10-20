import { Injectable, signal } from '@angular/core';
import { UserRole } from '../models/api.models';

const TOKEN_KEY = 'secure_pg_token';
const ROLE_KEY = 'secure_pg_role';
const EMAIL_KEY = 'secure_pg_email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(false);
  readonly role = signal<UserRole | null>(null);
  readonly email = signal<string | null>(null);

  constructor() {
    this.hydrateFromStorage();
  }

  setSession(token: string, role: UserRole, email: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(EMAIL_KEY, email);
    this.isAuthenticated.set(true);
    this.role.set(role);
    this.email.set(email);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this.isAuthenticated.set(false);
    this.role.set(null);
    this.email.set(null);
  }

  private hydrateFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY) as UserRole | null;
    const email = localStorage.getItem(EMAIL_KEY);
    if (token && role) {
      this.isAuthenticated.set(true);
      this.role.set(role);
      this.email.set(email);
    }
  }
}
