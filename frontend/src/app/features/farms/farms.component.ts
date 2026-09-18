import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Farms & Plots</h1>
        <p class="text-sm text-slate-500">Create a farm, add plots, and pin your location on the map.</p>
      </div>
      <span class="badge-demo">Demo / Simulated Data</span>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="card md:col-span-2 space-y-4">
        <div class="card-title">Farms</div>
        @if (farms.length === 0) { <div class="text-sm text-slate-400">No farms yet — create one below.</div> }
        @for (f of farms; track f.id) {
          <div class="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
            <div>
              <div class="font-semibold text-slate-800">{{ f.name }}</div>
              <div class="text-xs text-slate-500">{{ f.village }}, {{ f.district }}, {{ f.state }} · {{ f.total_area_ha }} ha</div>
            </div>
            <button class="btn-secondary" (click)="selectFarm(f.id)">Plots</button>
          </div>
        }
      </div>

      <div class="card">
        <div class="card-title">Add Farm</div>
        <div class="space-y-3 mt-3">
          <div><label class="label">Name</label><input class="input" [(ngModel)]="newFarm.name"></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="label">Village</label><input class="input" [(ngModel)]="newFarm.village"></div>
            <div><label class="label">District</label><input class="input" [(ngModel)]="newFarm.district"></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="label">Area (ha)</label><input class="input" type="number" [(ngModel)]="newFarm.total_area_ha"></div>
            <div><label class="label">Irrigation</label><input class="input" [(ngModel)]="newFarm.irrigation_type"></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="label">Latitude</label><input class="input" type="number" [(ngModel)]="newFarm.latitude"></div>
            <div><label class="label">Longitude</label><input class="input" type="number" [(ngModel)]="newFarm.longitude"></div>
          </div>
          <button class="btn-primary w-full justify-center" (click)="createFarm()">Save Farm</button>
        </div>
      </div>
    </div>

    @if (selectedFarmId) {
      <div class="grid md:grid-cols-2 gap-4">
        <div class="card">
          <div class="card-title">Plots for selected farm</div>
          @if (plots.length === 0) { <div class="text-sm text-slate-400 mt-2">No plots yet.</div> }
          @for (p of plots; track p.id) {
            <div class="p-3 rounded-lg bg-slate-50 mt-2 flex justify-between">
              <div>
                <div class="font-semibold text-slate-800">{{ p.name }}</div>
                <div class="text-xs text-slate-500">{{ p.area_ha }} ha · {{ p.soil_type }} · {{ p.irrigation_type }}</div>
              </div>
              <span class="text-xs text-slate-500">#{{ p.id }}</span>
            </div>
          }
        </div>

        <div class="card">
          <div class="card-title">Add Plot</div>
          <div class="space-y-3 mt-3">
            <div><label class="label">Plot name</label><input class="input" [(ngModel)]="newPlot.name"></div>
            <div class="grid grid-cols-2 gap-2">
              <div><label class="label">Area (ha)</label><input class="input" type="number" [(ngModel)]="newPlot.area_ha"></div>
              <div><label class="label">Soil type</label><input class="input" [(ngModel)]="newPlot.soil_type"></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div><label class="label">Irrigation</label><input class="input" [(ngModel)]="newPlot.irrigation_type"></div>
              <div><label class="label">Latitude</label><input class="input" type="number" [(ngModel)]="newPlot.latitude"></div>
            </div>
            <div><label class="label">Longitude</label><input class="input" type="number" [(ngModel)]="newPlot.longitude"></div>
            <button class="btn-primary w-full justify-center" (click)="createPlot()">Save Plot</button>
          </div>
        </div>
      </div>
    }
  </div>
  `
})
export class FarmsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  farms: any[] = [];
  plots: any[] = [];
  selectedFarmId?: number;

  newFarm = {
    name: 'Demo Farm', village: 'Demo Village', district: 'Demo District',
    state: 'Karnataka', total_area_ha: 1.5,
    latitude: 12.9716, longitude: 77.5946,
    soil_type: 'Red', irrigation_type: 'drip'
  };

  newPlot = { name: 'Plot A', area_ha: 0.75, soil_type: 'Red',
              irrigation_type: 'drip', latitude: 12.9716, longitude: 77.5946 };

  ngOnInit(): void { this.loadFarms(); }

  loadFarms() { this.api.listFarms().subscribe(fs => this.farms = fs); }

  createFarm() {
    this.api.createFarm(this.newFarm).subscribe({
      next: () => { this.toast.success('Farm created'); this.loadFarms(); },
      error: () => this.toast.error('Failed to create farm'),
    });
  }

  selectFarm(id: number) {
    this.selectedFarmId = id;
    this.api.listPlots(id).subscribe(ps => this.plots = ps);
  }

  createPlot() {
    if (!this.selectedFarmId) return;
    const payload = { ...this.newPlot, farm_id: this.selectedFarmId };
    this.api.createPlot(payload).subscribe({
      next: () => { this.toast.success('Plot created'); this.selectFarm(this.selectedFarmId!); },
      error: () => this.toast.error('Failed to create plot'),
    });
  }
}
