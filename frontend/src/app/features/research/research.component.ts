import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Research Dashboard</h1>
        <p class="text-sm text-slate-500">Model comparison, ablation study and dataset information.</p>
      </div>
      <span class="badge-demo">Demo Research Data</span>
    </div>

    @if (metrics) {
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card"><div class="card-title">Dataset size</div><div class="metric-value mt-2">{{ metrics.dataset_size }}</div></div>
        <div class="card"><div class="card-title">Models compared</div><div class="metric-value mt-2">{{ metrics.models.length }}</div></div>
        <div class="card"><div class="card-title">Best R²</div><div class="metric-value mt-2">{{ bestR2() }}</div></div>
        <div class="card"><div class="card-title">Best MAE</div><div class="metric-value mt-2">{{ bestMae() }}</div></div>
      </div>

      <div class="card">
        <div class="card-title">Model Comparison</div>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-slate-500">
              <tr><th class="text-left py-2">Model</th><th class="text-right">MAE</th><th class="text-right">RMSE</th><th class="text-right">R²</th><th class="text-right">MAPE</th></tr>
            </thead>
            <tbody>
              @for (m of metrics.models; track m.model) {
                <tr class="border-t border-slate-100">
                  <td class="py-2">{{ m.model }}</td>
                  <td class="text-right">{{ m.mae }}</td>
                  <td class="text-right">{{ m.rmse }}</td>
                  <td class="text-right">{{ m.r2 }}</td>
                  <td class="text-right">{{ m.mape ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Ablation Study</div>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-slate-500">
              <tr><th class="text-left py-2">Experiment</th><th class="text-right">MAE</th><th class="text-right">RMSE</th><th class="text-right">R²</th></tr>
            </thead>
            <tbody>
              @for (a of metrics.ablation; track a.experiment) {
                <tr class="border-t border-slate-100">
                  <td class="py-2">{{ a.experiment }}</td>
                  <td class="text-right">{{ a.mae }}</td>
                  <td class="text-right">{{ a.rmse }}</td>
                  <td class="text-right">{{ a.r2 }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <p class="text-xs text-slate-500">
        Values shown are DEMO data to illustrate the research UI. Replace with real MLflow metrics after training.
      </p>
    }
  </div>
  `
})
export class ResearchComponent implements OnInit {
  private api = inject(ApiService);
  metrics: any = null;

  ngOnInit(): void { this.api.researchMetrics().subscribe(m => this.metrics = m); }

  bestR2(): number { return this.metrics ? Math.max(...this.metrics.models.map((m: any) => m.r2)) : 0; }
  bestMae(): number { return this.metrics ? Math.min(...this.metrics.models.map((m: any) => m.mae)) : 0; }
}
