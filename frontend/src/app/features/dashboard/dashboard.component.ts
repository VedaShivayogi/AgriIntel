import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { DataBadgeComponent } from '../../shared/components/data-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MetricCardComponent, DataBadgeComponent],
  template: `
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Your Farm Intelligence</h1>
        <p class="text-sm text-slate-500">A quick overview of soil, weather, yield and profit.</p>
      </div>
      <app-data-badge />
    </div>

    <!-- Farm/Plot selectors -->
    <div class="card flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1">
        <label class="label">Farm</label>
        <select class="input" [(ngModel)]="selectedFarmId" (ngModelChange)="onFarmChange()">
          <option [ngValue]="undefined">— Select farm —</option>
          @for (f of farms; track f.id) { <option [ngValue]="f.id">{{ f.name }}</option> }
        </select>
      </div>
      <div class="flex-1">
        <label class="label">Plot</label>
        <select class="input" [(ngModel)]="selectedPlotId" (ngModelChange)="onPlotChange()">
          <option [ngValue]="undefined">— Select plot —</option>
          @for (p of plots; track p.id) { <option [ngValue]="p.id">{{ p.name }} ({{ p.area_ha }} ha)</option> }
        </select>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary" (click)="loadAll()">Refresh</button>
      </div>
    </div>

    <!-- Metric grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <app-metric-card title="Soil Health" [value]="(soilHealth?.score ?? '—') + '/100'"
                       [subtitle]="soilHealth?.status || 'No soil test'"></app-metric-card>
      <app-metric-card title="Expected Yield" [value]="yieldPrediction ? (yieldPrediction.predicted_yield_kg_ha | number:'1.0-0') + ' kg/ha' : '—'"
                       [subtitle]="yieldPrediction ? ('Range ' + (yieldPrediction.lower_bound_kg_ha | number:'1.0-0') + ' – ' + (yieldPrediction.upper_bound_kg_ha | number:'1.0-0')) : ''"></app-metric-card>
      <app-metric-card title="Expected Profit" [value]="profitPrediction ? ('₹' + (profitPrediction.profit | number:'1.0-0')) : '—'"
                       [subtitle]="profitPrediction ? ('ROI ' + profitPrediction.roi_pct + '%') : ''"></app-metric-card>
      <app-metric-card title="Overall Risk" [value]="risk?.overall_risk || '—'"
                       subtitle="Weather · Soil · Disease · Yield · Market"></app-metric-card>
    </div>

    <!-- Charts -->
    <div class="grid md:grid-cols-3 gap-4">
      <div class="card md:col-span-2">
        <div class="card-title">7-day Rainfall & Temperature (Demo)</div>
        <div class="mt-4 h-56 relative">
          @if (weather?.forecast?.length) {
            <svg viewBox="0 0 700 200" class="w-full h-full">
              @for (d of weather.forecast; track d.date; let i = $index) {
                <rect [attr.x]="40 + i * 90" [attr.y]="200 - (d.rainfall_mm * 2)"
                      [attr.width]="30" [attr.height]="d.rainfall_mm * 2"
                      fill="#4ade80" opacity="0.85" />
                <text [attr.x]="40 + i * 90 + 15" [attr.y]="195" text-anchor="middle"
                      font-size="10" fill="#64748b">{{ d.date.slice(5) }}</text>
                <circle [attr.cx]="40 + i * 90 + 15" [attr.cy]="200 - (d.temp_max_c * 3.5)"
                        r="4" fill="#f97316" />
              }
              <polyline fill="none" stroke="#f97316" stroke-width="2"
                [attr.points]="tempPolyline"></polyline>
            </svg>
            <div class="flex gap-4 text-xs text-slate-500 mt-2">
              <span><span class="inline-block w-3 h-3 bg-leaf-400 align-middle"></span> Rainfall (mm)</span>
              <span><span class="inline-block w-3 h-3 bg-orange-500 align-middle rounded-full"></span> Max temp (°C)</span>
            </div>
          } @else {
            <div class="h-full grid place-items-center text-slate-400 text-sm">Select a plot to load weather.</div>
          }
        </div>
      </div>
      <div class="card">
        <div class="card-title">Risk Breakdown (Demo)</div>
        @if (risk) {
          <ul class="mt-4 space-y-2 text-sm">
            @for (r of riskDims(); track r.key) {
              <li>
                <div class="flex justify-between text-slate-600"><span>{{ r.label }}</span><span>{{ r.value }}</span></div>
                <div class="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-2 rounded-full" [style.width.%]="r.value"
                       [style.background]="r.value > 70 ? '#ef4444' : (r.value > 45 ? '#f59e0b' : '#22c55e')"></div>
                </div>
              </li>
            }
          </ul>
        } @else {
          <div class="text-slate-400 text-sm mt-4">No risk prediction yet.</div>
        }
      </div>
    </div>

    <!-- AI Recommendation card -->
    <div class="card">
      <div class="card-title">AI Recommendation</div>
      @if (yieldPrediction) {
        <p class="mt-2 text-slate-700">
          Under the selected scenario, the platform estimates a yield of
          <b>{{ yieldPrediction.predicted_yield_kg_ha | number:'1.0-0' }} kg/ha</b>
          (range {{ yieldPrediction.lower_bound_kg_ha | number:'1.0-0' }} –
          {{ yieldPrediction.upper_bound_kg_ha | number:'1.0-0' }}), with model confidence
          {{ (yieldPrediction.confidence * 100) | number:'1.0-0' }}%.
        </p>
        <div class="mt-4 grid md:grid-cols-4 gap-3 text-sm">
          <div class="p-3 rounded-lg bg-slate-50">✓ Soil parameters</div>
          <div class="p-3 rounded-lg bg-slate-50">✓ Historical yield</div>
          <div class="p-3 rounded-lg bg-slate-50">✓ Weather</div>
          <div class="p-3 rounded-lg bg-slate-50">✓ Irrigation</div>
        </div>
        <p class="mt-4 text-xs text-slate-500">
          AI-generated agricultural recommendations are decision-support tools and should be
          validated with qualified agricultural experts / local extension services.
        </p>
      } @else {
        <p class="mt-2 text-slate-500 text-sm">Select a plot to generate a recommendation.</p>
      }
    </div>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  farms: any[] = [];
  plots: any[] = [];
  selectedFarmId?: number;
  selectedPlotId?: number;

  soilHealth: any = null;
  weather: any = null;
  yieldPrediction: any = null;
  profitPrediction: any = null;
  risk: any = null;

  ngOnInit(): void { this.loadFarms(); }

  loadFarms() {
    this.api.listFarms().subscribe((fs) => {
      this.farms = fs;
      if (fs.length && !this.selectedFarmId) {
        this.selectedFarmId = fs[0].id;
        this.onFarmChange();
      }
    });
  }

  onFarmChange() {
    if (!this.selectedFarmId) return;
    this.api.listPlots(this.selectedFarmId).subscribe((ps) => {
      this.plots = ps;
      if (ps.length) {
        this.selectedPlotId = ps[0].id;
        this.onPlotChange();
      }
    });
  }

  onPlotChange() {
    if (!this.selectedPlotId) return;
    const plotId = this.selectedPlotId;

    this.api.soilHealth(plotId).subscribe({
      next: (h) => this.soilHealth = h,
      error: () => this.soilHealth = null,
    });

    this.api.weather(plotId).subscribe({
      next: (w) => this.weather = w,
      error: () => this.weather = null,
    });

    this.api.predictYield({ plot_id: plotId }).subscribe({
      next: (y) => {
        this.yieldPrediction = y;
        this.loadProfit(y.predicted_yield_kg_ha);
      },
      error: () => this.yieldPrediction = null,
    });

    this.api.predictRisk({ plot_id: plotId }).subscribe({
      next: (r) => this.risk = r,
      error: () => this.risk = null,
    });
  }

  loadProfit(yieldKgHa: number) {
    const payload = {
      area_ha: 1.0,
      expected_yield_kg_ha: yieldKgHa,
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
    this.api.predictProfit(payload).subscribe((p) => this.profitPrediction = p);
  }

  riskDims() {
    if (!this.risk) return [];
    return [
      { key: 'weather', label: 'Weather', value: this.risk.weather_risk },
      { key: 'soil', label: 'Soil', value: this.risk.soil_risk },
      { key: 'disease', label: 'Disease', value: this.risk.disease_risk },
      { key: 'yield', label: 'Yield', value: this.risk.yield_risk },
      { key: 'market', label: 'Market', value: this.risk.market_risk },
      { key: 'input_cost', label: 'Input cost', value: this.risk.input_cost_risk },
    ];
  }

  get tempPolyline(): string {
    const f = this.weather?.forecast || [];
    return f.map((d: any, i: number) => `${40 + i * 90 + 15},${200 - (d.temp_max_c * 3.5)}`).join(' ');
  }

  loadAll() { this.onPlotChange(); }
}
