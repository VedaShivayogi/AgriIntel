import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Risk Intelligence</h1>
        <p class="text-sm text-slate-500">Inspectable risk across weather, soil, disease, yield, market and input costs.</p>
      </div>
      <span class="badge-demo">Rule-based demo</span>
    </div>

    <div class="card grid md:grid-cols-3 gap-3">
      <div><label class="label">Rainfall anomaly (%)</label><input class="input" type="number" [(ngModel)]="req.rainfall_anomaly_pct"></div>
      <div><label class="label">Soil health score</label><input class="input" type="number" [(ngModel)]="req.soil_health_score"></div>
      <div>
        <label class="label">Disease risk level</label>
        <select class="input" [(ngModel)]="req.disease_risk_level">
          <option value="low">low</option><option value="medium">medium</option>
          <option value="high">high</option><option value="critical">critical</option>
        </select>
      </div>
      <div><label class="label">Yield CV (%)</label><input class="input" type="number" [(ngModel)]="req.yield_cv_pct"></div>
      <div><label class="label">Price volatility (%)</label><input class="input" type="number" [(ngModel)]="req.price_volatility_pct"></div>
      <div><label class="label">Input cost inflation (%)</label><input class="input" type="number" [(ngModel)]="req.input_cost_inflation_pct"></div>
      <div class="md:col-span-3">
        <button class="btn-primary" (click)="run()">Assess Risk</button>
      </div>
    </div>

    @if (result) {
      <div class="card">
        <div class="flex items-center justify-between">
          <div class="card-title">Overall Risk</div>
          <span class="text-sm px-3 py-1 rounded-full"
                [class.bg-leaf-100]="result.overall_risk === 'Low'"
                [class.text-leaf-800]="result.overall_risk === 'Low'"
                [class.bg-amber-100]="result.overall_risk === 'Medium'"
                [class.text-amber-800]="result.overall_risk === 'Medium'"
                [class.bg-red-100]="result.overall_risk === 'High'"
                [class.text-red-800]="result.overall_risk === 'High'">{{ result.overall_risk }}</span>
        </div>
        <ul class="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          @for (d of dims(); track d.key) {
            <li class="p-3 rounded-lg bg-slate-50">
              <div class="flex justify-between"><b>{{ d.label }}</b><span>{{ d.value }}</span></div>
              <div class="text-xs text-slate-500 mt-1">{{ d.explain }}</div>
            </li>
          }
        </ul>
      </div>
    }
  </div>
  `
})
export class RiskComponent {
  private api = inject(ApiService);
  req = {
    rainfall_anomaly_pct: 10, soil_health_score: 78, disease_risk_level: 'low',
    yield_cv_pct: 12, price_volatility_pct: 15, input_cost_inflation_pct: 5,
  };
  result: any = null;

  run() { this.api.predictRisk(this.req).subscribe(r => this.result = r); }

  dims() {
    if (!this.result) return [];
    return [
      { key: 'weather', label: 'Weather', value: this.result.weather_risk, explain: this.result.explanations.weather },
      { key: 'soil', label: 'Soil', value: this.result.soil_risk, explain: this.result.explanations.soil },
      { key: 'disease', label: 'Disease', value: this.result.disease_risk, explain: this.result.explanations.disease },
      { key: 'yield', label: 'Yield', value: this.result.yield_risk, explain: this.result.explanations.yield },
      { key: 'market', label: 'Market', value: this.result.market_risk, explain: this.result.explanations.market },
      { key: 'input_cost', label: 'Input cost', value: this.result.input_cost_risk, explain: this.result.explanations.input_cost },
    ];
  }
}
