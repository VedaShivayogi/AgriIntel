import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

const TOKEN_KEY = 'agriintel_token';
const USER_KEY = 'agriintel_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  user = signal<any | null>(this.loadUser());

  private loadUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        const u = { id: res.user_id, role: res.role, full_name: res.full_name, email };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this.user.set(u);
      })
    );
  }

  register(payload: any) {
    return this.api.register(payload).pipe(
      tap((res: any) => {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        const u = { id: res.user_id, role: res.role, full_name: res.full_name, email: payload.email };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this.user.set(u);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
