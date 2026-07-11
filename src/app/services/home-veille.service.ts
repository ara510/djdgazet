import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { VeilleItem } from './veille.service';

export type HomeScale = 'compact' | 'normal' | 'grand';

/** Réglages de la section « Veille média » de l'accueil (pilotée par l'admin). */
export interface HomeVeilleSettings {
  enabled: boolean;
  mode: 'all' | 'pick';   // all = toutes les actualités ; pick = seulement la sélection
  ids: number[];          // ordre d'affichage (position) / sélection
  count: number;          // nombre max (0 = toutes)
  scale: HomeScale;       // échelle des cartes
}

/** Veille candidate (tous secteurs + actualité) proposée à la sélection dans l'admin. */
export interface HomeVeilleCandidate {
  id: number;
  title: string | null;
  excerpt: string | null;
  image: string | null;
  sector?: string | null;
  sectors?: string[] | null;
  tags?: string[] | null;
  published_at: string;
  pinned?: boolean;
}

export interface HomeVeilleResponse {
  enabled: boolean;
  scale: HomeScale;
  items: VeilleItem[];
}

@Injectable({ providedIn: 'root' })
export class HomeVeilleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly adminOpen = signal(false);
  readonly saving    = signal(false);
  /** Incrémenté à chaque enregistrement → l'accueil recharge sa liste en direct. */
  readonly version   = signal(0);

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  /** Liste publique résolue (affichée dans « Veille média » sur l'accueil). */
  loadPublic() {
    return this.http.get<HomeVeilleResponse>('/api/veille/home');
  }

  openAdmin()  { this.adminOpen.set(true); }
  closeAdmin() { this.adminOpen.set(false); }

  getSettings()   { return this.http.get<HomeVeilleSettings>('/api/veille/home/settings', { headers: this.headers() }); }
  getCandidates() { return this.http.get<HomeVeilleCandidate[]>('/api/veille/home/candidates', { headers: this.headers() }); }

  save(s: HomeVeilleSettings) {
    this.saving.set(true);
    return this.http.put<HomeVeilleSettings>('/api/veille/home/settings', s, { headers: this.headers() });
  }
}
