import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export type AlertLevel = 'urgent' | 'surveiller' | 'neutre';

/** Alerte temps réel — réservée aux abonnés Dédiée ; diffusée par email si notify est activé. */
export interface AlertItem {
  id: number;
  title?: string | null;
  source?: string | null;
  sources?: string[];          // sources multiples (comme récap/bulletin)
  url?: string | null;
  urls?: string[];             // liens multiples (url = urls[0], legacy)
  context?: string | null;
  level?: AlertLevel;          // objet de l'email : urgent / à surveiller / neutre
  notify?: boolean;            // envoi email à la publication (ON/OFF)
  sectors?: string[];          // secteurs (facultatifs, tags)
  source_types?: string[];     // types de source (facultatifs)
  social_networks?: string[];  // réseaux sociaux (si type social)
  published_at: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly items   = signal<AlertItem[]>([]);
  readonly loading = signal(false);

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  load() {
    this.loading.set(true);
    this.http.get<AlertItem[]>('/api/alerts', { headers: this.headers() }).subscribe({
      next: rows => { this.items.set(rows); this.loading.set(false); },
      error: ()   => { this.loading.set(false); },
    });
  }

  /** Crée + diffuse une alerte par email. La réponse inclut `sent` (nombre de destinataires). */
  create(body: Partial<AlertItem>) {
    return this.http.post<AlertItem & { sent: number }>('/api/alerts', body, { headers: this.headers() });
  }

  update(id: number, body: Partial<AlertItem>) {
    return this.http.patch<AlertItem>(`/api/alerts/${id}`, body, { headers: this.headers() });
  }

  remove(id: number) {
    return this.http.delete<{ success: boolean }>(`/api/alerts/${id}`, { headers: this.headers() });
  }
}
