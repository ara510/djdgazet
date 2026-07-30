import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

/** Réglages des articles de l'accueil (pilotés par l'admin). */
export interface HomeArticlesSettings {
  hero: number | null;   // article du grand emplacement « À la une » (null = le plus récent)
  featured: number[];    // articles remontés en tête de la grille, dans cet ordre
  hidden: number[];      // articles retirés de l'accueil
}

/** Article candidat proposé dans la modale de réglage. */
export interface HomeArticleCandidate {
  id: number;
  title: string;
  sector: string;
  author: string;
  image: string | null;
  published_at: string;
  views: number;
}

@Injectable({ providedIn: 'root' })
export class HomeArticlesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly adminOpen = signal(false);
  readonly saving    = signal(false);
  /** Incrémenté à chaque enregistrement → l'accueil recharge sa liste en direct. */
  readonly version   = signal(0);

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  openAdmin()  { this.adminOpen.set(true); }
  closeAdmin() { this.adminOpen.set(false); }

  getSettings()   { return this.http.get<HomeArticlesSettings>('/api/articles/home/settings', { headers: this.headers() }); }
  getCandidates() { return this.http.get<HomeArticleCandidate[]>('/api/articles/home/candidates', { headers: this.headers() }); }

  save(s: HomeArticlesSettings) {
    this.saving.set(true);
    return this.http.put<HomeArticlesSettings>('/api/articles/home/settings', s, { headers: this.headers() });
  }
}
