import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface MarqueeBand {
  enabled: boolean;
  items: string[];
  /** Vitesse de défilement 1 (lent) … 10 (rapide). */
  speed?: number;
}

/** Deux bandes « actualités & faits marquants » : `top` (sous le header) et `home` (accueil).
 *  `breaking` = bande « En continu » (titres de veille) : seule la vitesse est réglable. */
export interface MarqueeSettings {
  top: MarqueeBand;
  home: MarqueeBand;
  breaking?: { speed?: number };
}

/** Vitesse par défaut (milieu de l'échelle 1..10). */
const DEFAULT_SPEED = 5;
const clampSpeed = (n: unknown): number => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(10, Math.max(1, v)) : DEFAULT_SPEED;
};

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
  readonly topSpeed    = signal(DEFAULT_SPEED);
  readonly homeEnabled = signal(false);
  readonly homeItems   = signal<string[]>([]);
  readonly homeSpeed   = signal(DEFAULT_SPEED);
  /** Vitesse de la bande « En continu » (titres de veille sur l'accueil). */
  readonly breakingSpeed = signal(DEFAULT_SPEED);
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
    this.topSpeed.set(clampSpeed(s?.top?.speed));
    this.homeEnabled.set(!!s?.home?.enabled);
    this.homeItems.set(s?.home?.items || []);
    this.homeSpeed.set(clampSpeed(s?.home?.speed));
    this.breakingSpeed.set(clampSpeed(s?.breaking?.speed));
  }

  applySaved(s: MarqueeSettings) {
    this.apply(s);
    this.saving.set(false);
  }

  /** Charge utile complète reflétant l'état courant (pour un PUT qui ne perd rien). */
  private currentPayload(): MarqueeSettings {
    return {
      top:  { enabled: this.topEnabled(),  items: this.topItems(),  speed: this.topSpeed() },
      home: { enabled: this.homeEnabled(), items: this.homeItems(), speed: this.homeSpeed() },
      breaking: { speed: this.breakingSpeed() },
    };
  }

  /** Réglage GLOBAL de la vitesse (admin) : met à jour le signal puis persiste côté serveur.
   *  `band` : 'top' | 'home' | 'breaking'. */
  setSpeed(band: 'top' | 'home' | 'breaking', speed: number) {
    const n = clampSpeed(speed);
    if (band === 'top') this.topSpeed.set(n);
    else if (band === 'home') this.homeSpeed.set(n);
    else this.breakingSpeed.set(n);
    return this.http.put<MarqueeSettings>('/api/marquee', this.currentPayload(), { headers: this.headers() });
  }
}
