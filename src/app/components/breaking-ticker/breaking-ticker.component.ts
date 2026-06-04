import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-breaking-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gazety-red text-white overflow-hidden">
      <div class="container-news flex items-center gap-3 py-2">
        <div class="flex items-center gap-2 shrink-0 font-bold text-xs tracking-wider">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          {{ i18n.t('ticker.breaking') }}
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="flex gap-12 animate-marquee whitespace-nowrap text-sm">
            @for (item of items; track $index) {
              <span class="shrink-0">
                <span class="text-gazety-accent font-bold mr-2">●</span>
                {{ i18n.isFrench() ? item.fr : item.en }}
              </span>
            }
            @for (item of items; track $index) {
              <span class="shrink-0">
                <span class="text-gazety-accent font-bold mr-2">●</span>
                {{ i18n.isFrench() ? item.fr : item.en }}
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BreakingTickerComponent {
  protected readonly i18n = inject(I18nService);

  readonly items = [
    {
      fr: 'Sommet régional : 8 chefs d\'État attendus à Antananarivo dès demain',
      en: 'Regional summit: 8 heads of state expected in Antananarivo tomorrow',
    },
    {
      fr: 'Vanille : exportation record annoncée par la SAVA',
      en: 'Vanilla: record exports announced by SAVA',
    },
    {
      fr: 'Les Barea à un point des qualifications continentales',
      en: 'Barea one point from continental qualifications',
    },
    {
      fr: 'Cyclone : alerte orange maintenue sur la côte est',
      en: 'Cyclone: orange alert maintained on east coast',
    },
    {
      fr: 'Madajazzcar : programmation officielle dévoilée',
      en: 'Madajazzcar: official lineup revealed',
    },
  ];
}
