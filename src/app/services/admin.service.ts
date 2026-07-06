import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface FeedbackItem {
  id: number;
  rating: number | null;
  category: string | null;
  comment: string | null;
  created_at: string;
  username: string | null;
  nom: string | null;
  prenoms: string | null;
  email: string | null;
}

export interface ActivityEntry {
  id: number;
  actor_name: string | null;
  action: string;
  target: string | null;
  created_at: string;
}

export interface Stats {
  veille: {
    total: number; published: number; draft: number;
    byType: { source_type: string; count: number }[];
    bySector: { sector: string; count: number }[];
    byMonth: { month: string; count: number }[];
  };
  users: {
    total: number; admins: number; verified: number; disabled: number;
    byPlan: { plan: string; count: number }[];
  };
  feedback: {
    total: number; avg: number;
    byCategory: { category: string; count: number }[];
  };
}

export interface AdminUser {
  id: number;
  nom: string;
  prenoms: string;
  username: string;
  email: string;
  date_naissance: string | null;
  telephone: string | null;
  pays: string | null;
  ville: string | null;
  genre: string | null;
  notif_email: boolean;
  plan: 'generale' | 'sectorielle' | 'dediee';
  is_admin: boolean;
  email_verified: boolean;
  disabled: boolean;
  created_at: string;
  deleted_at: string | null;
}

/** Réponse paginée de GET /api/users (défilement infini). */
export interface UsersPage {
  users: AdminUser[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/** Réponse paginée de GET /api/activity (défilement infini). */
export interface ActivityPage {
  activity: ActivityEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly feedback        = signal<FeedbackItem[]>([]);
  readonly feedbackLoading = signal(false);

  readonly users            = signal<AdminUser[]>([]);
  readonly usersLoading      = signal(false);   // chargement de la 1re page
  readonly usersLoadingMore  = signal(false);   // chargement d'une page suivante
  readonly usersTotal        = signal(0);
  readonly usersHasMore      = signal(false);
  private  readonly USERS_PAGE = 20;

  readonly stats        = signal<Stats | null>(null);
  readonly statsLoading = signal(false);

  readonly activity            = signal<ActivityEntry[]>([]);
  readonly activityLoading      = signal(false);
  readonly activityLoadingMore  = signal(false);
  readonly activityTotal        = signal(0);
  readonly activityHasMore      = signal(false);
  private  readonly ACTIVITY_PAGE = 20;

  private headers() {
    return { Authorization: `Bearer ${this.auth.token()}` };
  }

  loadStats() {
    this.statsLoading.set(true);
    this.http.get<Stats>('/api/stats', { headers: this.headers() }).subscribe({
      next: s => { this.stats.set(s); this.statsLoading.set(false); },
      error: () => { this.statsLoading.set(false); },
    });
  }

  /** Charge (ou recharge) la première page du journal. */
  loadActivity() {
    this.activityLoading.set(true);
    this.http.get<ActivityPage>(`/api/activity?limit=${this.ACTIVITY_PAGE}&offset=0`, { headers: this.headers() }).subscribe({
      next: p => {
        this.activity.set(p.activity);
        this.activityTotal.set(p.total);
        this.activityHasMore.set(p.hasMore);
        this.activityLoading.set(false);
      },
      error: () => { this.activityLoading.set(false); },
    });
  }

  /** Défilement infini : ajoute la page suivante au journal. */
  loadMoreActivity() {
    if (this.activityLoadingMore() || !this.activityHasMore()) return;
    this.activityLoadingMore.set(true);
    const offset = this.activity().length;
    this.http.get<ActivityPage>(`/api/activity?limit=${this.ACTIVITY_PAGE}&offset=${offset}`, { headers: this.headers() }).subscribe({
      next: p => {
        this.activity.update(l => [...l, ...p.activity]);
        this.activityTotal.set(p.total);
        this.activityHasMore.set(p.hasMore);
        this.activityLoadingMore.set(false);
      },
      error: () => { this.activityLoadingMore.set(false); },
    });
  }

  loadFeedback() {
    this.feedbackLoading.set(true);
    this.http.get<FeedbackItem[]>('/api/feedback', { headers: this.headers() }).subscribe({
      next: rows => { this.feedback.set(rows); this.feedbackLoading.set(false); },
      error: ()   => { this.feedbackLoading.set(false); },
    });
  }

  /** Charge (ou recharge) la première page d'utilisateurs. */
  loadUsers() {
    this.usersLoading.set(true);
    this.http.get<UsersPage>(`/api/users?limit=${this.USERS_PAGE}&offset=0`, { headers: this.headers() }).subscribe({
      next: p => {
        this.users.set(p.users);
        this.usersTotal.set(p.total);
        this.usersHasMore.set(p.hasMore);
        this.usersLoading.set(false);
      },
      error: () => { this.usersLoading.set(false); },
    });
  }

  /** Défilement infini : ajoute la page suivante à la liste. */
  loadMoreUsers() {
    if (this.usersLoadingMore() || !this.usersHasMore()) return;
    this.usersLoadingMore.set(true);
    const offset = this.users().length;
    this.http.get<UsersPage>(`/api/users?limit=${this.USERS_PAGE}&offset=${offset}`, { headers: this.headers() }).subscribe({
      next: p => {
        this.users.update(list => [...list, ...p.users]);
        this.usersTotal.set(p.total);
        this.usersHasMore.set(p.hasMore);
        this.usersLoadingMore.set(false);
      },
      error: () => { this.usersLoadingMore.set(false); },
    });
  }

  updateUserPlan(id: number, plan: string) {
    return this.http.patch<{ id: number; plan: string }>(
      `/api/users/${id}/plan`, { plan }, { headers: this.headers() }
    );
  }

  setUserDisabled(id: number, disabled: boolean) {
    return this.http.patch<{ id: number; disabled: boolean }>(
      `/api/users/${id}/disabled`, { disabled }, { headers: this.headers() }
    );
  }

  /** Promeut/rétrograde un compte admin (case à cocher). */
  setUserAdmin(id: number, is_admin: boolean) {
    return this.http.patch<{ id: number; is_admin: boolean; username: string }>(
      `/api/users/${id}/admin`, { is_admin }, { headers: this.headers() }
    );
  }
}
