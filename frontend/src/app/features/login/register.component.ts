import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
        <h2 class="text-3xl font-bold leading-snug">Start your Farm Intelligence journey.</h2>
        <p class="mt-4 text-leaf-100">Chilli pilot for Karnataka. Register to explore the platform.</p>
      </div>
      <div class="text-xs text-leaf-200">All demo data is clearly labelled as simulated. Do not present synthetic data as real field data.</div>
    </div>
    <div class="flex items-center justify-center p-8 bg-slate-50">
      <form (ngSubmit)="submit()" class="w-full max-w-sm">
        <h1 class="text-2xl font-bold text-slate-900">Create account</h1>
        <p class="mt-1 text-sm text-slate-500">Quick registration — you can add farm details later.</p>
        <div class="mt-6 space-y-4">
          <div>
            <label class="label">Full name</label>
            <input class="input" name="full_name" [(ngModel)]="full_name" required>
          </div>
          <div>
            <label class="label">Email</label>
            <input class="input" type="email" name="email" [(ngModel)]="email" required>
          </div>
          <div>
            <label class="label">Password</label>
            <input class="input" type="password" name="password" [(ngModel)]="password" minlength="6" required>
          </div>
          <div>
            <label class="label">Role</label>
            <select class="input" name="role" [(ngModel)]="role">
              <option value="FARMER">Farmer</option>
              <option value="RESEARCHER">Researcher</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="label">Village</label>
              <input class="input" name="village" [(ngModel)]="village">
            </div>
            <div>
              <label class="label">District</label>
              <input class="input" name="district" [(ngModel)]="district">
            </div>
          </div>
          @if (error) { <div class="text-sm text-red-600">{{ error }}</div> }
          <button class="btn-primary w-full justify-center" type="submit" [disabled]="loading">
            {{ loading ? 'Creating…' : 'Create account' }}
          </button>
          <div class="text-sm text-slate-500 text-center">
            Already have an account? <a routerLink="/login" class="text-leaf-700 font-medium">Sign in</a>
          </div>
        </div>
      </form>
    </div>
  </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  full_name = '';
  email = '';
  password = '';
  role = 'FARMER';
  village = 'Demo Village';
  district = 'Demo District';
  loading = false;
  error: string | null = null;

  submit() {
    this.loading = true;
    this.error = null;
    this.auth.register({
      email: this.email,
      full_name: this.full_name,
      password: this.password,
      role: this.role,
      village: this.village,
      district: this.district,
      state: 'Karnataka',
    }).subscribe({
      next: () => { this.router.navigate(['/app/dashboard']); this.toast.success('Account created.'); },
      error: (e) => { this.loading = false; this.error = e?.error?.detail || 'Registration failed'; },
      complete: () => this.loading = false,
    });
  }
}
