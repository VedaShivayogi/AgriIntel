import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Crop Recommendation</h1>
        <p class="text-sm text-slate-500">Rank candidate crops by suitability, cost, revenue, profit and risk.</p>
      </div>
      <span class="badge-demo">Demo heuristic</span>
    </div>

    <div class="card grid md:grid-cols-4 gap-3">
      <div><label class="label">Soil pH</label><input class="input" type="number" step="0.1" [(ngModel)]="req.soil_ph"></div>
      <div><label class="label">Soil N (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_n"></div>
      <div><label class="label">Soil P (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_p"></div>
      <div><label class="label">Soil K (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.soil_k"></div>
      <div><label class="label">Rainfall (mm)</label><input class="input" type="number" [(ngModel)]="req.rainfall_mm"></div>
      <div><label class="label">Temp avg (°C)</label><input class="input" type="number" [(ngModel)]="req.temp_avg_c"></div>
      <div>
        <label class="label">Water availability</label>
        <select class="input" [(ngModel)]="req.water_availability">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </div>
      <div><label class="label">Farm area (ha)</label><input class="input" type="number" [(ngModel)]="req.farm_area_ha"></div>
      <div class="md:col-span-4">
        <button class="btn-primary" (click)="run()">Recommend Crops</button>
      </div>
    </div>

    @if (result) {
      <div class="grid md:grid-cols-3 gap-4">
        @for (c of result.candidates; track c.crop) {
          <div class="card">
            <div class="flex items-center justify-between">
              <div class="text-lg font-bold text-slate-900">{{ c.crop }}</div>
              <span class="text-xs px-2 py-1 rounded-full"
                    [class.bg-leaf-100]="c.risk === 'Low'"
                    [class.text-leaf-800]="c.risk === 'Low'"
                    [class.bg-amber-100]="c.risk === 'Medium'"
                    [class.text-amber-800]="c.risk === 'Medium'"
                    [class.bg-red-100]="c.risk === 'High'"
                    [class.text-red-800]="c.risk === 'High'">{{ c.risk }} risk</span>
            </div>
            <div class="mt-3 text-sm text-slate-600 space-y-1">
              <div>Suitability: <b>{{ c.suitability }}%</b></div>
              <div>Est. yield: <b>{{ c.expected_yield_kg_ha }} kg/ha</b></div>
              <div>Est. cost: ₹{{ c.expected_cost_inr | number:'1.0-0' }}</div>
              <div>Est. revenue: ₹{{ c.expected_revenue_inr | number:'1.0-0' }}</div>
              <div>Est. profit: <b>₹{{ c.expected_profit_inr | number:'1.0-0' }}</b></div>
              <div>Confidence: {{ (c.confidence * 100) | number:'1.0-0' }}%</div>
            </div>
            <div class="mt-3 text-xs text-slate-500">{{ c.explanation }}</div>
          </div>
        }
      </div>
      <p class="text-xs text-slate-500">{{ result.disclaimer }}</p>
    }
  </div>
  `
})
export class CropComponent {
  private api = inject(ApiService);
  req = {
    soil_ph: 6.7, soil_n: 300, soil_p: 22, soil_k: 190,
    rainfall_mm: 650, temp_avg_c: 27, water_availability: 'medium',
    farm_area_ha: 1.0, previous_crop: 'Maize',
    historical_yield_kg_ha: 4500, budget_inr: 150000, market_price_per_kg: 52,
  };
  result: any = null;

  run() {
    this.api.recommendCrop(this.req).subscribe(r => this.result = r);
  }
}
