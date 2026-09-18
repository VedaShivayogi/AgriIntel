import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-whatif',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">What-If Simulator</h1>
        <p class="text-sm text-slate-500">Adjust scenario parameters and compare against the baseline.</p>
      </div>
      <span class="badge-demo">Scenario simulation</span>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="card">
        <div class="card-title">Baseline</div>
        <div class="grid grid-cols-1 gap-3 mt-3">
          <div><label class="label">Baseline yield (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.baseline_yield_kg_ha"></div>
          <div><label class="label">Baseline price (₹/kg)</label><input class="input" type="number" [(ngModel)]="req.baseline_price_per_kg"></div>
          <div><label class="label">Baseline total cost (₹)</label><input class="input" type="number" [(ngModel)]="req.baseline_total_cost"></div>
        </div>
      </div>

      <div class="card md:col-span-2">
        <div class="card-title">Scenario sliders</div>
        <div class="mt-3 grid md:grid-cols-2 gap-4">
          <div>
            <label class="label">Rainfall change: {{ req.rainfall_change_pct }}%</label>
            <input type="range" min="-50" max="50" [(ngModel)]="req.rainfall_change_pct" class="w-full">
          </div>
          <div>
            <label class="label">Temperature change: {{ req.temp_change_c }} °C</label>
            <input type="range" min="-5" max="5" step="0.5" [(ngModel)]="req.temp_change_c" class="w-full">
          </div>
          <div>
            <label class="label">Fertilizer cost: {{ req.fertilizer_cost_change_pct }}%</label>
            <input type="range" min="-30" max="60" [(ngModel)]="req.fertilizer_cost_change_pct" class="w-full">
          </div>
          <div>
            <label class="label">Seed cost: {{ req.seed_cost_change_pct }}%</label>
            <input type="range" min="-30" max="60" [(ngModel)]="req.seed_cost_change_pct" class="w-full">
          </div>
          <div>
            <label class="label">Market price: {{ req.market_price_change_pct }}%</label>
            <input type="range" min="-50" max="80" [(ngModel)]="req.market_price_change_pct" class="w-full">
          </div>
          <div>
            <label class="label">Disease risk</label>
            <select class="input" [(ngModel)]="req.disease_risk_change">
              <option value="improved">improved</option>
              <option value="unchanged">unchanged</option>
              <option value="worsened">worsened</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-primary" (click)="run()">Simulate</button>

    @if (result) {
      <div class="grid md:grid-cols-2 gap-4">
        <div class="card">
          <div class="card-title">Baseline</div>
          <pre class="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{{ result.baseline | json }}</pre>
        </div>
        <div class="card">
          <div class="card-title">Scenario</div>
          <pre class="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{{ result.scenario | json }}</pre>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Delta (Scenario − Baseline)</div>
        <pre class="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{{ result.delta | json }}</pre>
      </div>
      <p class="text-xs text-slate-500">{{ result.disclaimer }}</p>
    }
  </div>
  `
})
export class WhatIfComponent {
  private api = inject(ApiService);
  req = {
    baseline_yield_kg_ha: 5200,
    baseline_price_per_kg: 52,
    baseline_total_cost: 146000,
    rainfall_change_pct: 0,
    temp_change_c: 0,
    fertilizer_cost_change_pct: 0,
    seed_cost_change_pct: 0,
    market_price_change_pct: 0,
    disease_risk_change: 'unchanged',
  };
  result: any = null;

  run() { this.api.whatIf(this.req).subscribe(r => this.result = r); }
}
