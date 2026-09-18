import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-soil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Soil Health</h1>
        <p class="text-sm text-slate-500">Record soil tests and view a health score with recommendations.</p>
      </div>
      <span class="badge-demo">Demo / Simulated Data</span>
    </div>

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
        <select class="input" [(ngModel)]="selectedPlotId" (ngModelChange)="loadHealth()">
          <option [ngValue]="undefined">— Select plot —</option>
          @for (p of plots; track p.id) { <option [ngValue]="p.id">{{ p.name }}</option> }
        </select>
      </div>
    </div>

    @if (health) {
      <div class="grid md:grid-cols-3 gap-4">
        <div class="card md:col-span-1">
          <div class="card-title">Soil Health Score</div>
          <div class="mt-4 flex items-end gap-3">
            <div class="text-5xl font-extrabold text-leaf-700">{{ health.score }}</div>
            <div class="text-slate-500 mb-2">/ 100</div>
          </div>
          <div class="mt-2 text-sm font-medium text-slate-700">{{ health.status }}</div>
          <div class="mt-3"><span class="badge-demo">Heuristic demo scoring</span></div>
        </div>

        <div class="card md:col-span-2">
          <div class="card-title">Components</div>
          <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            @for (key of componentKeys; track key) {
              <div class="p-3 rounded-lg bg-slate-50">
                <div class="text-xs text-slate-500">{{ key }}</div>
                <div class="font-semibold text-slate-800">{{ health.components[key]?.value ?? '—' }}</div>
                <div class="text-xs text-slate-500">Score {{ health.components[key]?.score }}</div>
              </div>
            }
          </div>
          <div class="mt-4">
            <div class="card-title">Recommendations</div>
            <ul class="list-disc list-inside text-sm text-slate-700 mt-2">
              @for (r of health.recommendations; track r) { <li>{{ r }}</li> }
            </ul>
          </div>
        </div>
      </div>
    }

    <div class="card">
      <div class="card-title">Add / Update Soil Test</div>
      <div class="grid md:grid-cols-4 gap-3 mt-3">
        <div><label class="label">pH</label><input class="input" type="number" step="0.1" [(ngModel)]="newTest.ph"></div>
        <div><label class="label">Nitrogen (kg/ha)</label><input class="input" type="number" [(ngModel)]="newTest.nitrogen_kg_ha"></div>
        <div><label class="label">Phosphorus (kg/ha)</label><input class="input" type="number" [(ngModel)]="newTest.phosphorus_kg_ha"></div>
        <div><label class="label">Potassium (kg/ha)</label><input class="input" type="number" [(ngModel)]="newTest.potassium_kg_ha"></div>
        <div><label class="label">Organic Carbon (%)</label><input class="input" type="number" step="0.01" [(ngModel)]="newTest.organic_carbon_pct"></div>
        <div><label class="label">EC (dS/m)</label><input class="input" type="number" step="0.01" [(ngModel)]="newTest.ec_ds_m"></div>
        <div><label class="label">Moisture (%)</label><input class="input" type="number" [(ngModel)]="newTest.moisture_pct"></div>
        <div><label class="label">Zinc (ppm)</label><input class="input" type="number" step="0.1" [(ngModel)]="newTest.zinc_ppm"></div>
      </div>
      <button class="btn-primary mt-4" (click)="saveSoilTest()" [disabled]="!selectedPlotId">Save Soil Test</button>
    </div>
  </div>
  `
})
export class SoilComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  farms: any[] = [];
  plots: any[] = [];
  selectedFarmId?: number;
  selectedPlotId?: number;
  health: any = null;

  componentKeys = ['ph', 'nitrogen_kg_ha', 'phosphorus_kg_ha', 'potassium_kg_ha', 'organic_carbon_pct', 'moisture_pct'];

  newTest: any = {
    ph: 6.7, nitrogen_kg_ha: 300, phosphorus_kg_ha: 22, potassium_kg_ha: 190,
    organic_carbon_pct: 0.9, ec_ds_m: 0.4, moisture_pct: 25, zinc_ppm: 0.8, iron_ppm: 4.5,
  };

  ngOnInit(): void { this.api.listFarms().subscribe(fs => this.farms = fs); }

  onFarmChange() {
    if (!this.selectedFarmId) return;
    this.api.listPlots(this.selectedFarmId).subscribe(ps => {
      this.plots = ps;
      if (ps.length) { this.selectedPlotId = ps[0].id; this.loadHealth(); }
    });
  }

  loadHealth() {
    if (!this.selectedPlotId) return;
    this.api.soilHealth(this.selectedPlotId).subscribe({
      next: (h) => this.health = h,
      error: () => this.health = null,
    });
  }

  saveSoilTest() {
    if (!this.selectedPlotId) return;
    const payload = { ...this.newTest, plot_id: this.selectedPlotId };
    this.api.createSoilTest(payload).subscribe({
      next: () => { this.toast.success('Soil test saved'); this.loadHealth(); },
      error: () => this.toast.error('Failed to save soil test'),
    });
  }
}
