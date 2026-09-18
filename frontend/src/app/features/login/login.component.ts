import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
  <div class="min-h-screen grid md:grid-cols-2">
    <div class="hidden md:flex flex-col justify-between bg-gradient-to-br from-leaf-700 to-emerald-900 text-white p-12">
      <a routerLink="/" class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl bg-white/20 grid place-items-center font-bold">A</div>
        <div class="font-bold">AgriIntel-X</div>
      </a>
      <div>
        <h2 class="text-3xl font-bold leading-snug">Welcome back to your Farm Intelligence.</h2>
        <p class="mt-4 text-leaf-100">Sign in to view soil, weather, yield, risk and profit insights for your farm.</p>
      </div>
      <div class="text-xs text-leaf-200">AI-generated agricultural recommendations are decision-support tools and should be validated with qualified agricultural experts.</div>
    </div>
    <div class="flex items-center justify-center p-8 bg-slate-50">
      <form (ngSubmit)="submit()" class="w-full max-w-sm">
        <h1 class="text-2xl font-bold text-slate-900">Sign in</h1>
        <p class="mt-1 text-sm text-slate-500">Use your email and password.</p>
        <div class="mt-6 space-y-4">
          <div>
            <label class="label">Email</label>
            <input class="input" type="email" name="email" [(ngModel)]="email" required>
          </div>
          <div>
            <label class="label">Password</label>
            <input class="input" type="password" name="password" [(ngModel)]="password" required>
          </div>
          @if (error) { <div class="text-sm text-red-600">{{ error }}</div> }
          <button class="btn-primary w-full justify-center" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
          <div class="text-sm text-slate-500 text-center">
            No account? <a routerLink="/register" class="text-leaf-700 font-medium">Create one</a>
          </div>
          <div class="text-xs text-slate-400 text-center">
            Demo tip: register any email/password to explore.
          </div>
        </div>
      </form>
    </div>
  </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = 'demo@agriintel.local';
  password = 'demo1234';
  loading = false;
  error: string | null = null;

  submit() {
    this.loading = true;
    this.error = null;
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.router.navigate(['/app/dashboard']); this.toast.success('Signed in.'); },
      error: (e) => { this.loading = false; this.error = e?.error?.detail || 'Login failed'; },
      complete: () => this.loading = false,
    });
  }
}
