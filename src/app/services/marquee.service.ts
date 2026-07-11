import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface MarqueeBand {
  enabled: boolean;
  items: string[];
}

/** Deux bandes « actualités & faits marquants » : `top` (sous le header) et `home` (accueil). */
export interface MarqueeSettings {
  top: MarqueeBand;
  home: MarqueeBand;
}

/**
 * Bandes marquee contrôlées par l'admin (on/off + lignes de texte), persistées côté serveur.
 * Bande 1 (`top`) : 1re bande, sous le header, sur tout le site.
 * Bande 2 (`home`) : sur l'accueil, juste avant « Veille média ».
 */
@Injectable({ providedIn: 'root' })
export class MarqueeService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly topEnabled  = signal(false);
  readonly topItems    = signal<string[]>([]);
  readonly homeEnabled = signal(false);
  readonly homeItems   = signal<string[]>([]);
  readonly adminOpen   = signal(false);
  readonly saving      = signal(false);
  private  loaded      = false;

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  /** Charge l'état public des deux bandes (une seule fois, sauf `force`). */
  load(force = false) {
    if (this.loaded && !force) return;
    this.loaded = true;
    this.http.get<MarqueeSettings>('/api/marquee').subscribe({
      next: s => this.apply(s),
      error: () => {},
    });
  }

  openAdmin()  { this.load(); this.adminOpen.set(true); }
  closeAdmin() { this.adminOpen.set(false); }

  /** Enregistre (admin) les deux bandes. */
  save(payload: MarqueeSettings) {
    this.saving.set(true);
    return this.http.put<MarqueeSettings>('/api/marquee', payload, { headers: this.headers() });
  }

  apply(s: MarqueeSettings) {
    this.topEnabled.set(!!s?.top?.enabled);
    this.topItems.set(s?.top?.items || []);
    this.homeEnabled.set(!!s?.home?.enabled);
    this.homeItems.set(s?.home?.items || []);
  }

  applySaved(s: MarqueeSettings) {
    this.apply(s);
    this.saving.set(false);
  }
}
