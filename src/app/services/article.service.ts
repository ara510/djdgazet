import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface ArticleItem {
  id: number;
  sector: string;
  title: string;
  description?: string | null;
  author: string;
  author_role?: string | null;
  published_at: string;
  creation_date?: string | null;
  read_minutes?: number | null;
  image?: string | null;
  image_alt?: string | null;
  image_position?: string | null; // cadrage object-position de la photo principale (ex. "50% 30%")
  images?: string[] | null;
  views: number;
  favorite?: boolean;
  locked?: boolean;
}

/** Veille en version favori (sous-ensemble renvoyé par /api/favorites). */
export interface FavoriteVeille {
  id: number;
  title: string | null;
  excerpt?: string | null;
  source?: string | null;
  source_type?: string | null;
  source_types?: string[] | null;
  social_networks?: string[] | null;
  sector?: string | null;
  sectors?: string[] | null;
  published_at?: string;
}

export interface Favorites {
  articles: ArticleItem[];
  veilles: FavoriteVeille[];
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private authHeaders() {
    const t = this.auth.token();
    return t ? { Authorization: `Bearer ${t}` } : undefined;
  }

  list(sector?: string) {
    const q = sector ? `?sector=${encodeURIComponent(sector)}` : '';
    return this.http.get<ArticleItem[]>(`/api/articles${q}`);
  }

  getOne(id: number | string) {
    return this.http.get<ArticleItem>(`/api/articles/${id}`, { headers: this.authHeaders() });
  }

  create(data: Partial<ArticleItem>) {
    return this.http.post<ArticleItem>('/api/articles', data, { headers: this.authHeaders() });
  }

  update(id: number, data: Partial<ArticleItem>) {
    return this.http.patch<ArticleItem>(`/api/articles/${id}`, data, { headers: this.authHeaders() });
  }

  remove(id: number) {
    return this.http.delete<{ success: boolean }>(`/api/articles/${id}`, { headers: this.authHeaders() });
  }

  toggleFavorite(id: number, favorite: boolean) {
    return this.http.post<{ favorite: boolean }>(`/api/articles/${id}/favorite`, { favorite }, { headers: this.authHeaders() });
  }

  favorites() {
    return this.http.get<Favorites>('/api/favorites', { headers: this.authHeaders() });
  }
}
