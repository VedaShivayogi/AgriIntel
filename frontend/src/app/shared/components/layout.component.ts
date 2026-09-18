import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
  <div class="min-h-screen flex bg-slate-50">
    <!-- Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-4">
      <div class="flex items-center gap-2 px-2 py-3">
        <div class="w-9 h-9 rounded-xl bg-leaf-600 text-white grid place-items-center font-bold">A</div>
        <div>
          <div class="font-bold text-slate-900">AgriIntel-X</div>
          <div class="text-[10px] uppercase tracking-wider text-slate-500">AI Ag Intelligence</div>
        </div>
      </div>
      <nav class="mt-4 flex flex-col gap-1 text-sm">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-leaf-50 text-leaf-700"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
            <span class="w-4 h-4 grid place-items-center" [innerHTML]="item.icon"></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="mt-auto text-xs text-slate-400 px-2 py-3">
        v0.1 MVP · Demo build
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-slate-100 px-4 md:px-8 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="md:hidden btn-secondary" (click)="toggleMobile()">☰</button>
          <div>
            <div class="text-sm text-slate-500">Welcome back,</div>
            <div class="font-semibold text-slate-900">{{ auth.user()?.full_name || 'Farmer' }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge-demo">Demo / Simulated Data</span>
          <button class="btn-secondary" (click)="auth.logout()">Sign out</button>
        </div>
      </header>

      <main class="flex-1 p-4 md:p-8 overflow-x-hidden">
        <router-outlet />
      </main>
    </div>

    <!-- Mobile nav drawer -->
    @if (mobileOpen) {
      <div class="fixed inset-0 bg-black/40 z-40 md:hidden" (click)="toggleMobile()"></div>
      <div class="fixed top-0 left-0 h-full w-64 bg-white z-50 p-4 md:hidden">
        <div class="font-bold text-slate-900 px-2 py-3">AgriIntel-X</div>
        <nav class="flex flex-col gap-1 text-sm">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" (click)="toggleMobile()" routerLinkActive="bg-leaf-50 text-leaf-700"
               class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </div>
    }

    <!-- Toasts -->
    <div class="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      @for (t of toast.toasts(); track t.id) {
        <div [class]="'px-4 py-3 rounded-lg shadow text-white text-sm ' +
          (t.type==='success' ? 'bg-leaf-600' : (t.type==='error' ? 'bg-red-600' : 'bg-slate-800'))">
          {{ t.message }}
        </div>
      }
    </div>
  </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  mobileOpen = false;
  toggleMobile() { this.mobileOpen = !this.mobileOpen; }

  navItems = [
    { label: 'Dashboard',       path: '/app/dashboard' },
    { label: 'Farms & Plots',   path: '/app/farms' },
    { label: 'Soil Health',     path: '/app/soil' },
    { label: 'Weather',         path: '/app/weather' },
    { label: 'Crop Recommend',  path: '/app/crop' },
    { label: 'Yield Forecast',  path: '/app/yield' },
    { label: 'Disease Detection', path: '/app/disease' },
    { label: 'Cost & Profit',   path: '/app/profit' },
    { label: 'Risk',            path: '/app/risk' },
    { label: 'What-If',         path: '/app/whatif' },
    { label: 'Research',        path: '/app/research' },
  ];
}
