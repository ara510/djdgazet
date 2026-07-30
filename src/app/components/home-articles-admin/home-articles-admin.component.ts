import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeArticlesService, HomeArticleCandidate } from '../../services/home-articles.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';

/**
 * Modale admin : pilote les ARTICLES de l'accueil.
 *  - « À la une » : quel article occupe le grand emplacement du haut (défaut = le plus récent) ;
 *  - « Mis en avant » : articles remontés en tête de la grille, dans l'ordre choisi ;
 *  - « Masqué » : article retiré de l'accueil (il reste accessible par son URL).
 * Même patron que la modale « Veilles de l'accueil ».
 */
@Component({
  selector: 'app-home-articles-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
      <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-silver-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-silver-200 sticky top-0 bg-white z-10">
          <h2 class="font-display font-bold text-lg text-gazety-dark">
            {{ fr ? 'Articles de l’accueil' : 'Home articles' }}
          </h2>
          <button (click)="close()" class="p-1.5 rounded hover:bg-silver-100 text-silver-500" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 py-4 space-y-5">
          <p class="text-sm text-silver-600">
            {{ fr
              ? 'Choisissez l’article « À la une » (le grand, en haut), remontez des articles en tête de la grille, ou retirez-en de l’accueil. Un article masqué reste accessible par son lien.'
              : 'Pick the “Featured” article (the big one on top), move articles to the front of the grid, or remove them from home. A hidden article stays reachable via its link.' }}
          </p>

          @if (loading()) {
            <p class="text-sm text-silver-500">{{ fr ? 'Chargement…' : 'Loading…' }}</p>
          } @else {
            <!-- Ordre des mis en avant -->
            @if (featuredItems().length) {
              <div>
                <span class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-2">
                  {{ fr ? 'Mis en avant — ordre en tête de grille' : 'Featured — order at grid head' }}
                </span>
                <ul class="space-y-1.5">
                  @for (a of featuredItems(); track a.id; let i = $index) {
                    <li class="flex items-center gap-2 px-2.5 py-1.5 rounded border border-silver-200 bg-silver-50">
                      <span class="w-5 h-5 shrink-0 rounded-full bg-gazety-dark text-white text-[10px] font-bold flex items-center justify-center">{{ i + 1 }}</span>
                      <span class="flex-1 text-sm text-gazety-dark truncate">{{ a.title }}</span>
                      <button type="button" (click)="move(a.id, -1)" [disabled]="i === 0" class="p-1 rounded hover:bg-silver-200 disabled:opacity-30" aria-label="Monter">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" (click)="move(a.id, 1)" [disabled]="i === featuredItems().length - 1" class="p-1 rounded hover:bg-silver-200 disabled:opacity-30" aria-label="Descendre">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <button type="button" (click)="toggleFeatured(a.id)" class="p-1 rounded hover:bg-silver-200 text-gazety-red" aria-label="Retirer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Liste des articles -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-silver-500">
                  {{ fr ? 'Tous les articles' : 'All articles' }}
                </span>
                <span class="text-xs text-silver-500">
                  {{ fr ? 'À la une : ' : 'Featured: ' }}
                  <strong class="text-gazety-dark">{{ heroLabel() }}</strong>
                </span>
              </div>

              <ul class="divide-y divide-silver-100 border border-silver-200 rounded">
                @for (a of candidates(); track a.id) {
                  <li class="flex items-center gap-3 px-3 py-2.5" [class.opacity-50]="isHidden(a.id)">
                    @if (a.image) {
                      <img [src]="a.image" alt="" class="w-14 h-10 object-cover rounded shrink-0 bg-silver-100" loading="lazy" />
                    } @else {
                      <span class="w-14 h-10 rounded bg-silver-100 shrink-0"></span>
                    }
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm font-semibold text-gazety-dark truncate">{{ a.title }}</span>
                      <span class="block text-[11px] text-silver-500 truncate">
                        {{ a.sector }} · {{ a.author }} · {{ a.published_at | date:'dd/MM/yy' }}
                        @if (isHero(a.id)) { <span class="text-gazety-red font-bold">· {{ fr ? 'À LA UNE' : 'FEATURED' }}</span> }
                      </span>
                    </span>

                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="setHero(a.id)" [disabled]="isHidden(a.id)"
                              [class.bg-gazety-red]="isHero(a.id)" [class.text-white]="isHero(a.id)"
                              [attr.title]="fr ? 'Mettre à la une' : 'Set as featured'"
                              class="px-2 py-1 rounded text-[11px] font-semibold border border-silver-300 hover:border-gazety-dark disabled:opacity-30">
                        {{ fr ? 'Une' : 'Top' }}
                      </button>
                      <button type="button" (click)="toggleFeatured(a.id)" [disabled]="isHidden(a.id) || isHero(a.id)"
                              [class.bg-gazety-dark]="isFeatured(a.id)" [class.text-white]="isFeatured(a.id)"
                              [attr.title]="fr ? 'Remonter en tête de grille' : 'Move to grid head'"
                              class="px-2 py-1 rounded text-[11px] font-semibold border border-silver-300 hover:border-gazety-dark disabled:opacity-30">
                        {{ fr ? 'Avant' : 'Front' }}
                      </button>
                      <button type="button" (click)="toggleHidden(a.id)"
                              [class.bg-silver-600]="isHidden(a.id)" [class.text-white]="isHidden(a.id)"
                              [attr.title]="fr ? 'Retirer de l’accueil' : 'Remove from home'"
                              class="px-2 py-1 rounded text-[11px] font-semibold border border-silver-300 hover:border-gazety-dark">
                        {{ isHidden(a.id) ? (fr ? 'Masqué' : 'Hidden') : (fr ? 'Masquer' : 'Hide') }}
                      </button>
                    </div>
                  </li>
                }
              </ul>
              <p class="text-xs text-silver-500 mt-1.5">
                {{ fr
                  ? 'Sans « À la une » choisie, l’article le plus récent occupe la place.'
                  : 'With no “Featured” pick, the most recent article takes the spot.' }}
              </p>
            </div>
          }
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-silver-200 sticky bottom-0 bg-white">
          <button (click)="close()" class="px-4 py-2 text-sm font-semibold text-silver-600 rounded hover:bg-silver-100">
            {{ fr ? 'Annuler' : 'Cancel' }}
          </button>
          <button (click)="save()" [disabled]="svc.saving()"
            class="px-4 py-2 text-sm font-semibold bg-gazety-dark text-white rounded hover:bg-gazety-dark/90 disabled:opacity-60">
            {{ svc.saving() ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HomeArticlesAdminComponent implements OnInit {
  protected readonly svc = inject(HomeArticlesService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  get fr(): boolean { return this.i18n.isFrench(); }

  readonly loading    = signal(true);
  readonly candidates = signal<HomeArticleCandidate[]>([]);
  readonly hero       = signal<number | null>(null);
  readonly featured   = signal<number[]>([]);
  readonly hidden     = signal<number[]>([]);

  readonly featuredItems = computed(() =>
    this.featured().map(id => this.candidates().find(c => c.id === id)).filter(Boolean) as HomeArticleCandidate[]);

  readonly heroLabel = computed(() => {
    const h = this.hero();
    const a = h ? this.candidates().find(c => c.id === h) : null;
    return a ? a.title : (this.fr ? 'le plus récent' : 'most recent');
  });

  ngOnInit() {
    this.svc.getCandidates().subscribe({
      next: r => { this.candidates.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.svc.getSettings().subscribe({
      next: s => { this.hero.set(s.hero); this.featured.set(s.featured ?? []); this.hidden.set(s.hidden ?? []); },
    });
  }

  close() { this.svc.closeAdmin(); }

  isHero(id: number)     { return this.hero() === id; }
  isFeatured(id: number) { return this.featured().includes(id); }
  isHidden(id: number)   { return this.hidden().includes(id); }

  /** À la une : re-cliquer sur le même article le remet en automatique (le plus récent). */
  setHero(id: number) {
    this.hero.set(this.hero() === id ? null : id);
    if (this.hero() === id) this.featured.update(a => a.filter(x => x !== id)); // pas de doublon une/grille
  }

  toggleFeatured(id: number) {
    this.featured.update(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  }

  /** Masquer retire aussi l'article de l'À la une et des mis en avant (cohérence). */
  toggleHidden(id: number) {
    const willHide = !this.hidden().includes(id);
    this.hidden.update(a => willHide ? [...a, id] : a.filter(x => x !== id));
    if (willHide) {
      if (this.hero() === id) this.hero.set(null);
      this.featured.update(a => a.filter(x => x !== id));
    }
  }

  move(id: number, dir: -1 | 1) {
    this.featured.update(a => {
      const i = a.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= a.length) return a;
      const b = [...a];
      [b[i], b[j]] = [b[j], b[i]];
      return b;
    });
  }

  save() {
    this.svc.save({ hero: this.hero(), featured: this.featured(), hidden: this.hidden() }).subscribe({
      next: () => {
        this.svc.saving.set(false);
        this.svc.version.update(v => v + 1); // rafraîchit l'accueil en direct
        this.toast.show(this.fr ? 'Articles de l’accueil mis à jour.' : 'Home articles updated.', 'success');
        this.close();
      },
      error: () => {
        this.svc.saving.set(false);
        this.toast.show(this.fr ? 'Échec de l’enregistrement.' : 'Save failed.', 'error');
      },
    });
  }
}
