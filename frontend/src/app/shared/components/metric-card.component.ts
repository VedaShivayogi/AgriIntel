import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card">
    <div class="card-title">{{ title }}</div>
    <div class="metric-value mt-2">{{ value }}</div>
    @if (subtitle) { <div class="text-xs text-slate-500 mt-1">{{ subtitle }}</div> }
    @if (isDemo) {
      <div class="mt-3"><span class="badge-demo">Demo / Simulated Data</span></div>
    }
  </div>
  `
})
export class MetricCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() isDemo = true;
}
