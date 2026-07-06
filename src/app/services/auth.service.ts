import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

/** Abonnements côté backend (= colonne users.plan). */
export type Plan = 'generale' | 'sectorielle' | 'dediee';
/** Alias historique utilisé par le front Gazety. */
export type SubscriptionTier = 'general' | 'sectorial' | 'dedicated';

export interface User {
  id: number;
  nom: string;
  prenoms: string;
  email: string;
  username: string;
  date_naissance: string;
  created_at: string;
  avatar?: string | null;
  telephone?: string | null;
  pays?: string | null;
  ville?: string | null;
  genre?: string | null;
  notif_email?: boolean;
  email_verified?: boolean;
  plan?: Plan;
  is_admin?: boolean;
  deleted_at?: string | null;
}

/** Correspondance plan backend → tier historique du front Gazety. */
const PLAN_TO_TIER: Record<Plan, SubscriptionTier> = {
  generale: 'general',
  sectorielle: 'sectorial',
  dediee: 'dedicated',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http  = inject(HttpClient);
  private toast = inject(ToastService);
  private i18n  = inject(I18nService);
  private zone  = inject(NgZone);

  readonly currentUser = signal<User | null>(null);
  readonly token       = signal<string | null>(localStorage.getItem('gazety_token'));

  /** Compat : l'ancien front Gazety lisait `auth.user()` / `auth.isLoggedIn` / `auth.tier()`. */
  readonly user       = this.currentUser;
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly tier       = computed<SubscriptionTier>(() => PLAN_TO_TIER[this.currentUser()?.plan ?? 'generale']);

  /** Notif « bienvenue admin » après vérification de l'email d'un compte staff. */
  readonly showAdminWelcome = signal(false);

  // ── Déconnexion automatique après inactivité ──────────────────────────────
  private readonly TIMEOUT_MS   = 2 * 60 * 60 * 1000; // 2 heures
  private readonly LAST_ACTIVITY = 'gazety_last_activity';
  private inactivityTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (this.token()) {
      if (this.isSessionExpired()) {
        this.expireSession();
      } else {
        this.loadMe();
        this.startInactivityTimer();
      }
    }
  }

  /** Appelé à chaque activité utilisateur (throttle 30 s). */
  resetActivityTimer() {
    if (!this.currentUser()) return;
    const now  = Date.now();
    const last = parseInt(localStorage.getItem(this.LAST_ACTIVITY) || '0', 10);
    if (now - last < 30_000) return;
    localStorage.setItem(this.LAST_ACTIVITY, now.toString());
    this.startInactivityTimer();
  }

  private isSessionExpired(): boolean {
    const last = localStorage.getItem(this.LAST_ACTIVITY);
    if (!last) return false;
    return Date.now() - parseInt(last, 10) > this.TIMEOUT_MS;
  }

  private startInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(
      () => this.zone.run(() => this.expireSession()),
      this.TIMEOUT_MS
    );
  }

  private expireSession() {
    this.logout();
    this.toast.show(
      this.i18n.isFrench()
        ? 'Votre session a été déconnectée après 2 h d’inactivité. Veuillez vous reconnecter.'
        : 'Your session was logged out after 2 h of inactivity. Please sign in again.',
      'error'
    );
  }

  register(data: object) {
    return this.http.post<{ token: string; user: User }>('/api/auth/register', data).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: User }>('/api/auth/login', { username, password }).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  logout() {
    clearTimeout(this.inactivityTimer);
    localStorage.removeItem('gazety_token');
    localStorage.removeItem(this.LAST_ACTIVITY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  updateProfile(data: object) {
    return this.http.patch<{ token: string; user: User }>('/api/auth/me', data, { headers: this.authHeaders() }).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  deleteAccount(password: string) {
    return this.http.delete<{ success: boolean }>('/api/auth/me', { headers: this.authHeaders(), body: { password } });
  }

  recoverAccount() {
    return this.http.post<{ token: string; user: User }>('/api/auth/recover', {}, { headers: this.authHeaders() }).pipe(
      tap(res => this.saveSession(res.token, res.user))
    );
  }

  sendEmailOtp() {
    return this.http.post('/api/auth/send-otp', {}, { headers: this.authHeaders() });
  }

  verifyEmailOtp(code: string) {
    return this.http.post<{ token: string; user: User }>('/api/auth/verify-otp', { code }, { headers: this.authHeaders() }).pipe(
      tap(res => {
        this.saveSession(res.token, res.user);
        if (res.user.is_admin && res.user.email_verified) this.showAdminWelcome.set(true);
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post('/api/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post('/api/auth/reset-password', { token, password });
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.token()}` };
  }

  private loadMe() {
    this.http.get<User>('/api/auth/me', { headers: this.authHeaders() }).subscribe({
      next:  user => this.currentUser.set(user),
      error: ()   => this.logout(),
    });
  }

  private saveSession(token: string, user: User) {
    localStorage.setItem('gazety_token', token);
    localStorage.setItem(this.LAST_ACTIVITY, Date.now().toString());
    this.token.set(token);
    this.currentUser.set(user);
    this.startInactivityTimer();
  }
}
