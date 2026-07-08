import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface MarqueeSettings {
  enabled: boolean;
  items: string[];
}

/**
 * Bande marquee « actualités & faits marquants » (1re bande, sous les secteurs).
 * Affichage contrôlé par l'admin (on/off + lignes de texte), persisté côté serveur.
 */
@Injectable({ providedIn: 'root' })
export class MarqueeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly enabled   = signal(false);
  readonly items     = signal<string[]>([]);
  readonly adminOpen = signal(false);
  readonly saving    = signal(false);
  private  loaded    = false;

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  /** Charge l'état public de la bande (une seule fois, sauf `force`). */
  load(force = false) {
    if (this.loaded && !force) return;
    this.loaded = true;
    this.http.get<MarqueeSettings>('/api/marquee').subscribe({
      next: s => { this.enabled.set(!!s.enabled); this.items.set(s.items || []); },
      error: () => {},
    });
  }

  openAdmin()  { this.load(); this.adminOpen.set(true); }
  closeAdmin() { this.adminOpen.set(false); }

  /** Enregistre (admin) puis met à jour l'état local. */
  save(enabled: boolean, items: string[]) {
    this.saving.set(true);
    return this.http.put<MarqueeSettings>('/api/marquee', { enabled, items }, { headers: this.headers() });
  }

  applySaved(s: MarqueeSettings) {
    this.enabled.set(!!s.enabled);
    this.items.set(s.items || []);
    this.saving.set(false);
  }
}
