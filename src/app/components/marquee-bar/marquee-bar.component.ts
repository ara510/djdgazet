import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarqueeService } from '../../services/marquee.service';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';

/**
 * Bande marquee défilante « actualités & faits marquants ».
 * `band="top"`  → 1re bande (sous le header) ; `band="home"` → 2e bande (accueil).
 * S'auto-masque tant que l'admin ne l'a pas activée (et qu'il n'y a aucune ligne).
 */
@Component({
  selector: 'app-marquee-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (enabled() && items().length) {
      <div class="bg-gazety-dark text-white overflow-hidden border-y border-gazety-red/40">
        <div class="container-news flex items-center gap-3 py-2">
          <div class="flex items-center gap-2 shrink-0 font-bold text-xs tracking-wider uppercase">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gazety-red opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-gazety-red"></span>
            </span>
            <span class="text-gazety-accent">{{ i18n.isFrench() ? 'À la une' : 'Headlines' }}</span>
          </div>
          <div class="flex-1 overflow-hidden">
            <!-- Deux blocs IDENTIQUES et de largeur égale : translateX(-50%) fait exactement
                 correspondre le 2e bloc à la place du 1er → boucle continue, sans coupure au milieu. -->
            <div class="flex w-max animate-marquee whitespace-nowrap text-sm" [style.animationDuration]="duration() + 's'">
              <div class="flex gap-12 pr-12 shrink-0">
                @for (item of items(); track $index) {
                  <span class="shrink-0"><span class="text-gazety-accent font-bold mr-2">●</span>{{ item }}</span>
                }
              </div>
              <div class="flex gap-12 pr-12 shrink-0" aria-hidden="true">
                @for (item of items(); track $index) {
                  <span class="shrink-0"><span class="text-gazety-accent font-bold mr-2">●</span>{{ item }}</span>
                }
              </div>
            </div>
          </div>
          <!-- Réglage de la vitesse — admins uniquement, caché derrière une icône d'options. -->
          @if (isAdmin()) {
            <div class="shrink-0 flex items-center gap-2 pl-1">
              @if (showOpts()) {
                <label class="hidden sm:inline-flex items-center gap-2 text-silver-300">
                  <span class="sr-only">{{ i18n.isFrench() ? 'Vitesse de défilement' : 'Scroll speed' }}</span>
                  <input type="range" min="1" max="10" step="1" class="marquee-speed marquee-speed--dark w-16 md:w-20"
                         [value]="speed()" (input)="onSpeedInput($event)" (change)="onSpeedCommit($event)"
                         [attr.aria-label]="i18n.isFrench() ? 'Vitesse de défilement de la bande' : 'Ticker scroll speed'"
                         [attr.aria-valuetext]="speed() + '/10'" />
                </label>
              }
              <button type="button" (click)="showOpts.set(!showOpts())"
                      class="p-1 rounded-sm text-silver-300 hover:text-white transition-colors"
                      [attr.aria-expanded]="showOpts()"
                      [attr.aria-label]="i18n.isFrench() ? 'Options de la bande' : 'Ticker options'"
                      [title]="i18n.isFrench() ? 'Options (vitesse)' : 'Options (speed)'">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class MarqueeBarComponent {
  protected readonly marquee = inject(MarqueeService);
  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);

  /** Réglage réservé aux admins, caché derrière une icône d'options. */
  protected readonly isAdmin = computed(() => !!this.auth.currentUser()?.is_admin);
  protected readonly showOpts = signal(false);

  /** Quelle bande afficher : `top` (sous le header) ou `home` (accueil). */
  readonly band = input<'top' | 'home'>('top');

  protected readonly enabled = computed(() =>
    this.band() === 'home' ? this.marquee.homeEnabled() : this.marquee.topEnabled());
  protected readonly items = computed(() =>
    this.band() === 'home' ? this.marquee.homeItems() : this.marquee.topItems());

  /** Vitesse GLOBALE (réglage admin persisté serveur), lue depuis le service. */
  protected readonly speed = computed(() =>
    this.band() === 'home' ? this.marquee.homeSpeed() : this.marquee.topSpeed());
  /** Durée d'un cycle en secondes (inverse de la vitesse) : 1→60s, 10→6s. */
  protected readonly duration = computed(() => 66 - this.speed() * 6);

  private clamp(ev: Event): number {
    return Math.min(10, Math.max(1, parseInt((ev.target as HTMLInputElement).value, 10) || 5));
  }

  /** Pendant le glissement : aperçu en direct (signal local du service, sans requête). */
  onSpeedInput(ev: Event): void {
    const n = this.clamp(ev);
    (this.band() === 'home' ? this.marquee.homeSpeed : this.marquee.topSpeed).set(n);
  }

  /** Au relâchement : persistance GLOBALE côté serveur (pour tous les visiteurs). */
  onSpeedCommit(ev: Event): void {
    this.marquee.setSpeed(this.band(), this.clamp(ev)).subscribe({ error: () => {} });
  }
}
