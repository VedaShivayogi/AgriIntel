import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-profit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Cost & Profit</h1>
        <p class="text-sm text-slate-500">Compute total cost, revenue, profit, ROI and break-even values.</p>
      </div>
      <span class="badge-demo">Calculated, not predicted</span>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="card space-y-3">
        <div class="card-title">Inputs</div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Area (ha)</label><input class="input" type="number" [(ngModel)]="req.area_ha"></div>
          <div><label class="label">Expected yield (kg/ha)</label><input class="input" type="number" [(ngModel)]="req.expected_yield_kg_ha"></div>
          <div class="col-span-2"><label class="label">Selling price (₹/kg)</label><input class="input" type="number" [(ngModel)]="req.selling_price_per_kg"></div>
        </div>
      </div>

      <div class="card space-y-3">
        <div class="card-title">Costs (₹)</div>
        <div class="grid grid-cols-2 gap-3">
          @for (c of req.costs; track c.category) {
            <div>
              <label class="label">{{ c.category }}</label>
              <input class="input" type="number" [(ngModel)]="c.amount">
            </div>
          }
        </div>
      </div>
    </div>

    <button class="btn-primary" (click)="run()">Compute</button>

    @if (result) {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card"><div class="card-title">Total Cost</div><div class="metric-value mt-2">₹{{ result.total_cost | number:'1.0-0' }}</div></div>
        <div class="card"><div class="card-title">Revenue</div><div class="metric-value mt-2">₹{{ result.revenue | number:'1.0-0' }}</div></div>
        <div class="card"><div class="card-title">Profit</div><div class="metric-value mt-2" [class.text-leaf-700]="result.profit > 0" [class.text-red-600]="result.profit < 0">₹{{ result.profit | number:'1.0-0' }}</div></div>
        <div class="card"><div class="card-title">ROI</div><div class="metric-value mt-2">{{ result.roi_pct }}%</div></div>
        <div class="card"><div class="card-title">Break-even price</div><div class="metric-value mt-2">₹{{ result.break_even_price }}/kg</div></div>
        <div class="card"><div class="card-title">Break-even yield</div><div class="metric-value mt-2">{{ result.break_even_yield_kg_ha }} kg/ha</div></div>
      </div>
    }
  </div>
  `
})
export class ProfitComponent {
  private api = inject(ApiService);
  req = {
    area_ha: 1,
    expected_yield_kg_ha: 5200,
    selling_price_per_kg: 52,
    costs: [
      { category: 'seed', amount: 12000 },
      { category: 'fertilizer', amount: 24000 },
      { category: 'pesticide', amount: 9000 },
      { category: 'labour', amount: 45000 },
      { category: 'irrigation', amount: 12000 },
      { category: 'machinery', amount: 8000 },
      { category: 'other', amount: 5000 },
    ],
  };
  result: any = null;

  run() {
    this.api.predictProfit({
      area_ha: this.req.area_ha,
      expected_yield_kg_ha: this.req.expected_yield_kg_ha,
      selling_price_per_kg: this.req.selling_price_per_kg,
      costs: this.req.costs,
    }).subscribe(r => this.result = r);
  }
}
