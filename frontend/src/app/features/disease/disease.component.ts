import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Disease Detection</h1>
        <p class="text-sm text-slate-500">Upload a chilli leaf image. The MVP uses a clearly-labelled DEMO provider.</p>
      </div>
      <span class="badge-demo">DEMO provider</span>
    </div>

    <div class="card">
      <label class="label">Leaf image</label>
      <input class="input" type="file" accept="image/*" (change)="onFile($event)">
      <div class="mt-3 flex gap-3 items-center">
        <button class="btn-primary" (click)="predict()" [disabled]="!file || loading">
          {{ loading ? 'Analysing…' : 'Analyse Image' }}
        </button>
        @if (preview) { <span class="text-xs text-slate-500">Selected image loaded.</span> }
      </div>
    </div>

    @if (result) {
      <div class="grid md:grid-cols-2 gap-4">
        <div class="card">
          <div class="card-title">Result</div>
          <div class="mt-2 text-2xl font-bold text-slate-900">{{ result.label }}</div>
          <div class="text-sm text-slate-500">Confidence: {{ (result.confidence * 100) | number:'1.0-0' }}%</div>
          <div class="text-sm text-slate-500">Risk: {{ result.risk }}</div>
          <div class="text-xs text-slate-500 mt-2">Provider: {{ result.provider }}</div>
          @if (result.is_demo) { <div class="mt-3"><span class="badge-demo">DEMO PREDICTION</span></div> }
          <div class="mt-4 p-3 rounded-lg bg-amber-50 text-amber-900 text-sm">
            {{ result.disclaimer }}
          </div>
        </div>
        @if (preview) {
          <div class="card">
            <div class="card-title">Uploaded image</div>
            <img [src]="preview" alt="leaf" class="mt-3 rounded-xl max-h-80 object-contain" />
          </div>
        }
      </div>
    }
  </div>
  `
})
export class DiseaseComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  file?: File;
  preview?: string;
  loading = false;
  result: any = null;

  onFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.file = f;
    const reader = new FileReader();
    reader.onload = () => this.preview = reader.result as string;
    reader.readAsDataURL(f);
  }

  predict() {
    if (!this.file) return;
    this.loading = true;
    this.api.predictDisease(this.file).subscribe({
      next: (r) => { this.result = r; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Failed to analyse image.'); },
    });
  }
}
