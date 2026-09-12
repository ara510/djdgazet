import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { VeilleItem } from './veille.service';

export type SearchType = 'article' | 'veille';

export interface SearchArticle {
  id: number;
  sector: string | null;
  title: string;
  image: string | null;
  image_alt: string | null;
  published_at: string;
  excerpt: string;
}

export interface SearchResponse {
  type: SearchType;
  q: string;
  results: SearchArticle[] | VeilleItem[];
}

/** Recherche publique par mot-clé / titre : articles OU veilles (endpoint /api/search). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  search(q: string, type: SearchType) {
    // Jeton envoyé si connecté → un abonné voit les veilles déverrouillées (optionalAuth côté serveur).
    const token = this.auth.token();
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const params = `q=${encodeURIComponent(q)}&type=${type}`;
    return this.http.get<SearchResponse>(`/api/search?${params}`, options);
  }
}
