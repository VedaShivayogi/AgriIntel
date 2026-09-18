import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/login/register.component').then(m => m.RegisterComponent) },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'farms',    loadComponent: () => import('./features/farms/farms.component').then(m => m.FarmsComponent) },
      { path: 'soil',     loadComponent: () => import('./features/soil/soil.component').then(m => m.SoilComponent) },
      { path: 'weather',  loadComponent: () => import('./features/weather/weather.component').then(m => m.WeatherComponent) },
      { path: 'crop',     loadComponent: () => import('./features/crop/crop.component').then(m => m.CropComponent) },
      { path: 'yield',    loadComponent: () => import('./features/yield/yield.component').then(m => m.YieldComponent) },
      { path: 'disease',  loadComponent: () => import('./features/disease/disease.component').then(m => m.DiseaseComponent) },
      { path: 'profit',   loadComponent: () => import('./features/profit/profit.component').then(m => m.ProfitComponent) },
      { path: 'risk',     loadComponent: () => import('./features/risk/risk.component').then(m => m.RiskComponent) },
      { path: 'whatif',   loadComponent: () => import('./features/whatif/whatif.component').then(m => m.WhatIfComponent) },
      { path: 'research', loadComponent: () => import('./features/research/research.component').then(m => m.ResearchComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
