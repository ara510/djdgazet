import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarqueeService } from '../../services/marquee.service';
import { I18nService } from '../../services/i18n.service';

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
            <div class="flex gap-12 animate-marquee whitespace-nowrap text-sm">
              @for (item of items(); track $index) {
                <span class="shrink-0"><span class="text-gazety-accent font-bold mr-2">●</span>{{ item }}</span>
              }
              @for (item of items(); track $index) {
                <span class="shrink-0"><span class="text-gazety-accent font-bold mr-2">●</span>{{ item }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class MarqueeBarComponent {
  protected readonly marquee = inject(MarqueeService);
  protected readonly i18n = inject(I18nService);

  /** Quelle bande afficher : `top` (sous le header) ou `home` (accueil). */
  readonly band = input<'top' | 'home'>('top');

  protected readonly enabled = computed(() =>
    this.band() === 'home' ? this.marquee.homeEnabled() : this.marquee.topEnabled());
  protected readonly items = computed(() =>
    this.band() === 'home' ? this.marquee.homeItems() : this.marquee.topItems());
}
