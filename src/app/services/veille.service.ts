import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

export type VeilleType = 'web' | 'social' | 'radio' | 'tv' | 'presse';

export interface VeilleItem {
  id: number;
  title?: string | null;
  source?: string | null;
  sources?: string[];
  source_type: VeilleType;
  source_types?: string[];
  social_network?: string | null;
  social_networks?: string[];
  sector?: string | null;
  sectors?: string[];
  tone?: 'positif' | 'neutre' | 'negatif' | null;
  tags?: string[];            // Générale : 'actualite' / 'fait_marquant' (pas des secteurs)
  category?: 'daily' | 'weekly';
  trends?: string | null;     // bulletin hebdo : tendances de la semaine (facultatif)
  signals?: string | null;    // bulletin hebdo : signaux d'alerte (facultatif)
  media_dediee?: boolean;     // médias (photo/vidéo/lien) réservés à la Dédiée
  url?: string | null;
  urls?: string[] | null;     // liens multiples de la source (url = urls[0], legacy)
  excerpt?: string | null;
  image?: string | null;
  images?: string[];
  images_count?: number;
  video?: string | null;
  has_video?: boolean;
  author?: string | null;
  status?: 'draft' | 'published';
  pinned?: boolean;
  scheduled?: boolean;
  published_at: string;
  created_at: string;
  deleted_at?: string | null;
  favorite?: boolean;
  read?: boolean;
  locked?: boolean;           // accueil : teaser verrouillé (veille sectorielle payante)
  media_locked?: boolean;     // accueil : médias réservés à la Dédiée (photo/liens retirés)
  justify?: boolean;          // extrait affiché en texte justifié
}

export interface VeilleFilters {
  type?: string | null;
  sector?: string | null;
  q?: string;
  from?: string;
  to?: string;
  category?: string | null;   // daily (récap) / weekly (bulletin)
  reading?: 'all' | 'unread' | 'favorites';
}

/** Réponse paginée de GET /api/veille. `unread`/`favorites` comptent TOUT le fil filtré
 *  (hors filtre de lecture) pour que les badges restent justes malgré la pagination. */
export interface VeillePage {
  items: VeilleItem[];
  total: number;
  unread: number;
  favorites: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class VeilleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly isOpen  = signal(false);
  readonly items   = signal<VeilleItem[]>([]);
  readonly loading = signal(false);
  // Pagination du fil : totaux serveur (badges justes) + état « charger plus ».
  readonly total          = signal(0);
  readonly unreadTotal    = signal(0);
  readonly favoritesTotal = signal(0);
  readonly hasMore        = signal(false);
  readonly loadingMore    = signal(false);

  readonly trash        = signal<VeilleItem[]>([]);
  readonly trashLoading = signal(false);

  /** Veille à ouvrir en détail dès l'ouverture du dashboard (deep-link depuis une page secteur). */
  readonly targetId = signal<number | null>(null);

  open()  { this.isOpen.set(true); this.load(); }
  close() { this.isOpen.set(false); this.targetId.set(null); }

  /** Ouvre le dashboard directement sur une veille précise. */
  openItem(id: number) { this.targetId.set(id); this.isOpen.set(true); this.load(); }

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  loadTrash() {
    this.trashLoading.set(true);
    this.http.get<VeilleItem[]>('/api/veille/trash', { headers: this.headers() }).subscribe({
      next: rows => { this.trash.set(rows); this.trashLoading.set(false); },
      error: ()   => { this.trashLoading.set(false); },
    });
  }

  restore(id: number) {
    return this.http.post(`/api/veille/${id}/restore`, {}, { headers: this.headers() });
  }

  deletePermanent(id: number) {
    return this.http.delete(`/api/veille/${id}/permanent`, { headers: this.headers() });
  }

  /** Filtres de la dernière requête — rejoués tels quels pour charger la page suivante. */
  private lastFilters: VeilleFilters = {};

  private buildParams(filters: VeilleFilters, offset: number): HttpParams {
    let params = new HttpParams();
    if (filters.type)     params = params.set('type', filters.type);
    if (filters.sector)   params = params.set('sector', filters.sector);
    if (filters.q)        params = params.set('q', filters.q);
    if (filters.from)     params = params.set('from', filters.from);
    if (filters.to)       params = params.set('to', filters.to);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.reading && filters.reading !== 'all') params = params.set('reading', filters.reading);
    return params.set('offset', String(offset));
  }

  /** Charge (ou recharge) la 1re page du fil. Les filtres — y compris « non lus » / « favoris » —
   *  sont appliqués côté serveur, donc ils portent sur tout le fil et pas sur la page chargée. */
  load(filters: VeilleFilters = {}) {
    this.lastFilters = filters;
    this.loading.set(true);
    this.http.get<VeillePage>('/api/veille', { headers: this.headers(), params: this.buildParams(filters, 0) }).subscribe({
      next: p => {
        this.items.set(p.items);
        this.total.set(p.total);
        this.unreadTotal.set(p.unread);
        this.favoritesTotal.set(p.favorites);
        this.hasMore.set(p.hasMore);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  /** Page suivante : ajoute au fil déjà affiché. */
  loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;
    this.loadingMore.set(true);
    const offset = this.items().length;
    this.http.get<VeillePage>('/api/veille', { headers: this.headers(), params: this.buildParams(this.lastFilters, offset) }).subscribe({
      next: p => {
        this.items.update(list => [...list, ...p.items]);
        this.total.set(p.total);
        this.unreadTotal.set(p.unread);
        this.favoritesTotal.set(p.favorites);
        this.hasMore.set(p.hasMore);
        this.loadingMore.set(false);
      },
      error: () => { this.loadingMore.set(false); },
    });
  }

  create(body: Partial<VeilleItem>) {
    return this.http.post<VeilleItem>('/api/veille', body, { headers: this.headers() });
  }

  update(id: number, body: Partial<VeilleItem>) {
    return this.http.patch<VeilleItem>(`/api/veille/${id}`, body, { headers: this.headers() });
  }

  remove(id: number) {
    return this.http.delete<{ success: boolean }>(`/api/veille/${id}`, { headers: this.headers() });
  }

  /** Détail complet d'une veille (inclut la vidéo, chargée à la demande). */
  getOne(id: number) {
    return this.http.get<VeilleItem>(`/api/veille/${id}`, { headers: this.headers() });
  }

  /** Met à jour l'état (favori/lu) localement + côté serveur. */
  setState(id: number, patch: { favorite?: boolean; read?: boolean }) {
    // Les compteurs viennent du serveur (ils portent sur tout le fil, pas sur la page chargée) :
    // on les ajuste ici pour que les badges réagissent immédiatement au clic.
    const before = this.items().find(i => i.id === id);
    if (before) {
      if (patch.read !== undefined && !!before.read !== patch.read)
        this.unreadTotal.update(n => Math.max(0, n + (patch.read ? -1 : 1)));
      if (patch.favorite !== undefined && !!before.favorite !== patch.favorite)
        this.favoritesTotal.update(n => Math.max(0, n + (patch.favorite ? 1 : -1)));
    }
    this.items.update(list => list.map(i => i.id === id ? { ...i, ...patch } : i));
    return this.http.post(`/api/veille/${id}/state`, patch, { headers: this.headers() });
  }

  /** Épingle / désépingle une veille (admin). */
  setPinned(id: number, pinned: boolean) {
    return this.http.patch(`/api/veille/${id}/pin`, { pinned }, { headers: this.headers() });
  }

  /** Upload de médias sur le serveur (fichiers) → renvoie les URLs. */
  upload(files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return this.http.post<{ urls: string[] }>('/api/upload', fd, { headers: this.headers() });
  }
}
