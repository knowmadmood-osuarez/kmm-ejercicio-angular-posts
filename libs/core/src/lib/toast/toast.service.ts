import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  messageKey: string;
  params?: Record<string, unknown>;
}

const AUTO_DISMISS_MS = 3500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(messageKey: string, params?: Record<string, unknown>): void {
    this._add('success', messageKey, params);
  }

  error(messageKey: string, params?: Record<string, unknown>): void {
    this._add('error', messageKey, params);
  }

  dismiss(id: number): void {
    this.toasts.update((ts) => ts.filter((t) => t.id !== id));
  }

  private _add(type: Toast['type'], messageKey: string, params?: Record<string, unknown>): void {
    const id = this._nextId++;
    this.toasts.update((ts) => [...ts, { id, type, messageKey, params }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}

