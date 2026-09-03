import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';
const KEY = 'hl-theme';

/** Thème clair/sombre : mémorisé (localStorage), sinon suit la préférence système.
 *  Applique la classe `dark` sur <html> (Tailwind darkMode: 'class' + couche de thème
 *  dans styles.scss). Un petit script inline dans index.html pose déjà la classe avant
 *  le premier rendu pour éviter le flash ; ce service garde l'état côté Angular. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  private initial(): Theme {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* stockage indisponible */ }
    try {
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch { /* matchMedia indisponible */ }
    return 'light';
  }

  constructor() { this.apply(this.theme()); }

  toggle() { this.set(this.theme() === 'dark' ? 'light' : 'dark'); }

  set(t: Theme) {
    this.theme.set(t);
    this.apply(t);
    try { localStorage.setItem(KEY, t); } catch { /* stockage indisponible */ }
  }

  private apply(t: Theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', t === 'dark');
    root.style.colorScheme = t; // scrollbars / form controls natifs
  }
}
