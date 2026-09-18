import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-yield',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Yield Forecast</h1>
        <p class="text-sm text-slate-500">Estimate yield with uncertainty range and confidence.</p>
      </div>
      <span class="badge-demo">Demo model</span>
    </div>

    <div class="card grid md:grid-cols-3 gap-3">
      <div><label class="label">Soil pH</label><input class="input" type="number" step="0.1" [(ngModel)]="req.soil_ph"></div>
      <div><label class="label">Soil N (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_n"></div>
      <div><label class="label">Soil P (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_p"></div>
      <div><label class="label">Soil K (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_k"></div>
      <div><label class="label">Rainfall (mm)</label><input class="input" type="number" [(ngModel)]="req.rainfall_mm"></div>
      <div><label class="label">Temp avg (°C)</label><input class="input" type="number" [(ngModel)]="req.temp_avg_c"></div>
      <div><label class="label">Humidity (%)</label><input class="input" type="number" [(ngModel)]="req.humidity_pct"></div>
      <div><label class="label">Fertilizer (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.fertilizer_kg_ha"></div>
      <div><label class="label">Historical yield (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.historical_yield_kg_ha"></div>
      <div class="md:col-span-3">
        <button class="btn-primary" (click)="run()">Predict Yield</button>
      </div>
    </div>

    @if (result) {
      <div class="grid md:grid-cols-3 gap-4">
        <div class="card md:col-span-2">
          <div class="card-title">Expected Yield</div>
          <div class="mt-2 text-4xl font-extrabold text-leaf-700">
            {{ result.predicted_yield_kg_ha | number:'1.0-0' }} kg/ha
          </div>
          <div class="text-sm text-slate-500 mt-1">
            Range: {{ result.lower_bound_kg_ha | number:'1.0-0' }} – {{ result.upper_bound_kg_ha | number:'1.0-0' }} kg/ha
          </div>
          <div class="mt-3 text-sm text-slate-700">
            Model: <b>{{ result.model_name }}</b> · v{{ result.model_version }} ·
            Confidence: <b>{{ (result.confidence * 100) | number:'1.0-0' }}%</b>
          </div>
          @if (result.is_demo) {
            <div class="mt-3"><span class="badge-demo">DEMO — heuristic model. Replace with trained model.</span></div>
          }
        </div>
        <div class="card">
          <div class="card-title">Explanation Inputs</div>
          <ul class="mt-3 text-sm text-slate-700 space-y-1">
            @for (kv of explanationEntries(); track kv[0]) {
              <li class="flex justify-between border-b border-slate-100 py-1">
                <span class="text-slate-500">{{ kv[0] }}</span>
                <span class="font-medium">{{ kv[1] ?? '—' }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    }
  </div>
  `
})
export class YieldComponent {
  private api = inject(ApiService);
  req = {
    soil_ph: 6.7, soil_n: 320, soil_p: 24, soil_k: 200,
    rainfall_mm: 700, temp_avg_c: 27, humidity_pct: 70,
    irrigation_type: 'drip', fertilizer_kg_ha: 260,
    historical_yield_kg_ha: 4800, disease_risk: 'low',
  };
  result: any = null;

  run() { this.api.predictYield(this.req).subscribe(r => this.result = r); }

  explanationEntries(): [string, any][] {
    if (!this.result?.explanation) return [];
    return Object.entries(this.result.explanation);
  }
}
