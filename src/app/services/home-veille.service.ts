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
  source_types?: string[] | null;
  published_at: string;
  pinned?: boolean;
}

export interface HomeVeilleResponse {
  enabled: boolean;
  scale: HomeScale;
  items: VeilleItem[];
}

/** Fil « Dernières actualités » de l'accueil (liste compacte paginée). */
export interface LatestResponse {
  items: VeilleItem[];
  cat?: 'actualite' | 'fait_marquant';
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  gated: boolean;   // visiteur : la suite nécessite un compte
}

/** Catégories gratuites (plan Générale) affichées en fil façon Facebook. */
export type FeedCat = 'actualite' | 'fait_marquant';

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

  /** Liste résolue affichée dans « Veille média » sur l'accueil.
   *  Le token est transmis QUAND il existe (endpoint en optionalAuth) : le serveur peut
   *  alors déverrouiller les teasers payants pour un admin / un abonné au bon niveau,
   *  et lever le plafond de 6 items réservé aux visiteurs. Sans token → visiteur anonyme. */
  loadPublic() {
    const token = this.auth.token();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.get<HomeVeilleResponse>('/api/veille/home', { headers });
  }

  /** Fil paginé d'une catégorie gratuite (« Dernières actualités » sur l'accueil, ou le fil
   *  plein écran Actualité / Fait marquant). Token transmis s'il existe : le visiteur est
   *  bloqué au-delà de la 1re page (`gated`). `cat` par défaut = actualite (accueil inchangé). */
  loadLatest(page = 1, cat: FeedCat = 'actualite', q = '') {
    const token = this.auth.token();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const qs = q ? `&q=${encodeURIComponent(q)}` : '';
    return this.http.get<LatestResponse>(`/api/veille/latest?page=${page}&cat=${cat}${qs}`, { headers });
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
