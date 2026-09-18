import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Weather Intelligence</h1>
        <p class="text-sm text-slate-500">7-day forecast, rainfall, temperature and agronomic alerts.</p>
      </div>
      <span class="badge-demo">{{ weather?.source === 'mock' ? 'Demo / Mock Provider' : 'Live Provider' }}</span>
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
        <select class="input" [(ngModel)]="selectedPlotId" (ngModelChange)="loadWeather()">
          <option [ngValue]="undefined">— Select plot —</option>
          @for (p of plots; track p.id) { <option [ngValue]="p.id">{{ p.name }}</option> }
        </select>
      </div>
    </div>

    @if (weather) {
      <div class="grid md:grid-cols-4 gap-4">
        @if (weather.current) {
          <div class="card"><div class="card-title">Today Min</div><div class="metric-value mt-2">{{ weather.current.temp_min_c }}°C</div></div>
          <div class="card"><div class="card-title">Today Max</div><div class="metric-value mt-2">{{ weather.current.temp_max_c }}°C</div></div>
          <div class="card"><div class="card-title">Rainfall</div><div class="metric-value mt-2">{{ weather.current.rainfall_mm }} mm</div></div>
          <div class="card"><div class="card-title">Humidity</div><div class="metric-value mt-2">{{ weather.current.humidity_pct }}%</div></div>
        }
      </div>

      <div class="card">
        <div class="card-title">7-Day Forecast</div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-slate-500">
              <tr>
                <th class="text-left py-2">Date</th>
                <th class="text-right">Min °C</th>
                <th class="text-right">Max °C</th>
                <th class="text-right">Rain (mm)</th>
                <th class="text-right">Humidity %</th>
                <th class="text-right">Wind (km/h)</th>
              </tr>
            </thead>
            <tbody>
              @for (d of weather.forecast; track d.date) {
                <tr class="border-t border-slate-100">
                  <td class="py-2">{{ d.date }}</td>
                  <td class="text-right">{{ d.temp_min_c }}</td>
                  <td class="text-right">{{ d.temp_max_c }}</td>
                  <td class="text-right">{{ d.rainfall_mm }}</td>
                  <td class="text-right">{{ d.humidity_pct }}</td>
                  <td class="text-right">{{ d.wind_kmph }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (weather.alerts?.length) {
        <div class="card">
          <div class="card-title">Agricultural Alerts</div>
          <ul class="mt-3 space-y-2">
            @for (a of weather.alerts; track a.type) {
              <li class="p-3 rounded-lg flex items-start gap-3"
                  [class.bg-red-50]="a.level === 'high'"
                  [class.bg-amber-50]="a.level === 'medium'"
                  [class.bg-slate-50]="a.level === 'low'">
                <span class="font-semibold text-xs uppercase text-slate-600">{{ a.type }}</span>
                <span class="text-sm text-slate-700">{{ a.message }}</span>
              </li>
            }
          </ul>
        </div>
      }
    }
  </div>
  `
})
export class WeatherComponent implements OnInit {
  private api = inject(ApiService);
  farms: any[] = [];
  plots: any[] = [];
  selectedFarmId?: number;
  selectedPlotId?: number;
  weather: any = null;

  ngOnInit(): void { this.api.listFarms().subscribe(fs => this.farms = fs); }

  onFarmChange() {
    if (!this.selectedFarmId) return;
    this.api.listPlots(this.selectedFarmId).subscribe(ps => {
      this.plots = ps;
      if (ps.length) { this.selectedPlotId = ps[0].id; this.loadWeather(); }
    });
  }

  loadWeather() {
    if (!this.selectedPlotId) return;
    this.api.weather(this.selectedPlotId).subscribe(w => this.weather = w);
  }
}
