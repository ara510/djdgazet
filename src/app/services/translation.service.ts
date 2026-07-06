import { Injectable, inject } from '@angular/core';
import { TRANSLATIONS } from '../i18n/translations';
import { I18nService } from './i18n.service';

/**
 * Traductions du sous-système Veille (dashboard, auth, chat, cookie, vitrine).
 * La langue est déléguée à I18nService → un seul interrupteur FR/EN pour tout le site.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private i18n = inject(I18nService);

  /** Langue courante (signal partagé avec I18nService). */
  readonly lang = this.i18n.lang;

  toggle() {
    this.i18n.toggle();
  }

  t(key: string): string {
    return TRANSLATIONS[this.lang()][key] ?? key;
  }
}
