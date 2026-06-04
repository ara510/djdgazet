import { Injectable, signal, computed } from '@angular/core';

export type SubscriptionTier = 'general' | 'sectorial' | 'dedicated';

export interface User {
  name: string;
  email: string;
  tier: SubscriptionTier;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly tier = computed(() => this._user()?.tier ?? 'general');

  login(email: string) {
    this._user.set({
      name: email.split('@')[0] ?? 'User',
      email,
      tier: 'general',
    });
  }

  signup(name: string, email: string) {
    this._user.set({ name, email, tier: 'general' });
  }

  logout() {
    this._user.set(null);
  }
}
