import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; message: string; type: 'info'|'success'|'error'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(message: string, type: Toast['type'] = 'info', durationMs = 3500) {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
  success(m: string) { this.show(m, 'success'); }
  error(m: string)   { this.show(m, 'error'); }
  info(m: string)    { this.show(m, 'info'); }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
