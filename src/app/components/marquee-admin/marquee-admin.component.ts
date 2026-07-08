import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarqueeService } from '../../services/marquee.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';

/**
 * Modale admin : contrôle de la 1re bande marquee (activation + lignes de texte).
 * Une ligne du textarea = une entrée de la bande (actualité / fait marquant).
 */
@Component({
  selector: 'app-marquee-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
      <div class="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-silver-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-silver-200">
          <h2 class="font-display font-bold text-lg text-gazety-dark">
            {{ fr ? 'Bande d’actualités' : 'News ticker' }}
          </h2>
          <button (click)="close()" class="p-1.5 rounded hover:bg-silver-100 text-silver-500" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 py-4 space-y-4">
          <p class="text-sm text-silver-600">
            {{ fr
              ? 'Bande défilante affichée sur tout le site, juste sous les secteurs. Vous décidez de l’afficher ou non.'
              : 'Scrolling band shown across the site, right below the sectors. You decide whether to display it.' }}
          </p>

          <!-- Toggle d'affichage -->
          <label class="flex items-center justify-between gap-3 py-2 px-3 rounded border border-silver-200 cursor-pointer">
            <span class="text-sm font-semibold text-gazety-dark">
              {{ fr ? 'Afficher la bande' : 'Show the band' }}
            </span>
            <input type="checkbox" [(ngModel)]="enabled" class="h-5 w-5 accent-gazety-red cursor-pointer" />
          </label>

          <!-- Contenu : une ligne = une entrée -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-1.5">
              {{ fr ? 'Contenu (une ligne = une actualité)' : 'Content (one line = one item)' }}
            </label>
            <textarea
              [(ngModel)]="text"
              rows="7"
              class="w-full rounded border border-silver-300 px-3 py-2 text-sm focus:border-gazety-dark focus:outline-none resize-y"
              [placeholder]="placeholder"
            ></textarea>
            <p class="text-xs text-silver-500 mt-1">{{ lineCount }} {{ fr ? 'ligne(s)' : 'line(s)' }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-silver-200">
          <button (click)="close()" class="px-4 py-2 text-sm font-semibold text-silver-600 rounded hover:bg-silver-100">
            {{ fr ? 'Annuler' : 'Cancel' }}
          </button>
          <button (click)="save()" [disabled]="marquee.saving()"
            class="px-4 py-2 text-sm font-semibold bg-gazety-dark text-white rounded hover:bg-gazety-dark/90 disabled:opacity-60">
            {{ marquee.saving() ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MarqueeAdminComponent {
  protected readonly marquee = inject(MarqueeService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  enabled = this.marquee.enabled();
  text = this.marquee.items().join('\n');

  get fr(): boolean { return this.i18n.isFrench(); }
  get placeholder(): string {
    return this.fr
      ? 'Sommet régional : 8 chefs d’État attendus…\nVanille : exportation record annoncée…'
      : 'Regional summit: 8 heads of state expected…\nVanilla: record exports announced…';
  }
  get lines(): string[] { return this.text.split('\n').map(s => s.trim()).filter(Boolean); }
  get lineCount(): number { return this.lines.length; }

  close() { this.marquee.closeAdmin(); }

  save() {
    const items = this.lines;
    this.marquee.save(this.enabled, items).subscribe({
      next: s => {
        this.marquee.applySaved(s);
        this.toast.show(this.fr ? 'Bande mise à jour.' : 'Ticker updated.', 'success');
        this.close();
      },
      error: () => {
        this.marquee.saving.set(false);
        this.toast.show(this.fr ? 'Échec de l\'enregistrement.' : 'Save failed.', 'error');
      },
    });
  }
}
