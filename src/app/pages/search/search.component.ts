import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { SearchService, SearchType, SearchArticle } from '../../services/search.service';
import { VeilleItem } from '../../services/veille.service';
import { normalizeExternalUrl } from '../../utils/url';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  template: `
    <div class="container-news py-8">
      <h1 class="font-display font-black text-3xl sm:text-4xl text-gazety-dark mb-1">
        {{ fr() ? 'Recherche' : 'Search' }}
      </h1>
      <p class="text-sm text-silver-600 mb-6">
        {{ fr() ? 'Recherchez un mot-clé ou un titre parmi les articles et les veilles.' : 'Search a keyword or title across articles and media watches.' }}
      </p>

      <!-- Barre de recherche : mot-clé + type (liste déroulante) -->
      <form class="flex flex-col sm:flex-row gap-2 mb-8" (submit)="$event.preventDefault(); submit()">
        <div class="relative flex-1">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-silver-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input #qinput type="search" name="q" [(ngModel)]="q"
                 [placeholder]="fr() ? 'Mot-clé ou titre…' : 'Keyword or title…'"
                 class="w-full pl-9 pr-3 py-2.5 bg-white border border-silver-300 rounded-sm text-sm text-gazety-dark focus:outline-none focus:border-gazety-red" />
        </div>
        <select name="type" [(ngModel)]="type"
                class="px-3 py-2.5 bg-white border border-silver-300 rounded-sm text-sm text-gazety-dark focus:outline-none focus:border-gazety-red">
          <option value="article">{{ fr() ? 'Articles' : 'Articles' }}</option>
          <option value="veille">{{ fr() ? 'Veilles' : 'Media watch' }}</option>
        </select>
        <button type="submit" class="btn-primary text-sm" [disabled]="loading() || !q.trim()">
          {{ loading() ? (fr() ? 'Recherche…' : 'Searching…') : (fr() ? 'Rechercher' : 'Search') }}
        </button>
      </form>

      @if (searched()) {
        @if (loading()) {
          <app-loader />
        } @else if (total() === 0) {
          <p class="text-sm text-silver-500">
            {{ fr() ? 'Aucun résultat pour ' : 'No results for ' }}« {{ lastQuery() }} ».
          </p>
        } @else {
          <p class="text-xs uppercase tracking-wider text-silver-500 mb-4">
            {{ total() }} {{ fr() ? 'résultat(s)' : 'result(s)' }}
          </p>

          <!-- Résultats ARTICLES -->
          @if (type === 'article') {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (a of articleResults(); track a.id) {
                <a [routerLink]="['/article', a.id]" class="tap-press group block bg-white border border-silver-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow">
                  @if (a.image) {
                    <div class="aspect-[16/9] overflow-hidden bg-silver-100">
                      <img [src]="a.image" [alt]="a.image_alt || a.title" loading="lazy" decoding="async"
                           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  }
                  <div class="p-4">
                    @if (a.sector) { <span class="category-tag mb-1 block">{{ sectorLabel(a.sector) }}</span> }
                    <h3 class="font-display font-bold text-lg text-gazety-dark leading-snug line-clamp-2 mb-1">{{ a.title }}</h3>
                    <p class="text-sm text-silver-600 line-clamp-2">{{ a.excerpt }}</p>
                    <span class="text-[11px] text-silver-400 mt-2 block">{{ fmtDate(a.published_at) }}</span>
                  </div>
                </a>
              }
            </div>
          } @else {
            <!-- Résultats VEILLES -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (v of veilleResults(); track v.id) {
                <article class="bg-white border border-silver-200 rounded-sm p-4">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="category-tag">{{ sectorLabel(v.sector) || (fr() ? 'Veille' : 'Watch') }}</span>
                    <span class="text-[11px] text-silver-400 ml-auto">{{ fmtDate(v.published_at) }}</span>
                  </div>
                  <h3 class="font-display font-bold text-lg text-gazety-dark leading-snug mb-1">{{ heading(v) }}</h3>
                  @if (v.locked) {
                    <p class="text-sm text-silver-500 italic mb-2">
                      {{ fr() ? 'Contenu réservé aux abonnés.' : 'Subscriber-only content.' }}
                    </p>
                    <button type="button" (click)="goLocked()" class="text-sm font-semibold text-gazety-red hover:underline">
                      {{ fr() ? "S'abonner pour lire →" : 'Subscribe to read →' }}
                    </button>
                  } @else {
                    @if (v.excerpt) { <p class="text-sm text-silver-600 line-clamp-3 mb-2">{{ v.excerpt }}</p> }
                    @if (urlsOf(v).length) {
                      <div class="flex flex-wrap gap-2 mt-2">
                        @for (u of urlsOf(v); track u) {
                          <a [href]="u" target="_blank" rel="noopener noreferrer nofollow"
                             class="inline-flex items-center gap-1 text-xs text-gazety-red hover:underline">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            {{ hostOf(u) }}
                          </a>
                        }
                      </div>
                    }
                  }
                </article>
              }
            </div>
          }
        }
      }
    </div>
  `,
})
export class SearchComponent {
  private i18n = inject(I18nService);
  private auth = inject(AuthService);
  private authModal = inject(AuthModalService);
  private searchSvc = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly fr = computed(() => this.i18n.isFrench());

  q = '';
  type: SearchType = 'article';

  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly lastQuery = signal('');
  private readonly results = signal<(SearchArticle | VeilleItem)[]>([]);
  readonly total = computed(() => this.results().length);
  readonly articleResults = computed(() => this.results() as SearchArticle[]);
  readonly veilleResults = computed(() => this.results() as VeilleItem[]);

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.q = qp.get('q') || '';
    this.type = qp.get('type') === 'veille' ? 'veille' : 'article';
    if (this.q.trim()) this.run();
  }

  submit() {
    if (!this.q.trim()) return;
    // Met à jour l'URL (partageable / rechargeable) puis lance la recherche.
    this.router.navigate([], { queryParams: { q: this.q.trim(), type: this.type } });
    this.run();
  }

  private run() {
    const q = this.q.trim();
    if (!q) return;
    this.loading.set(true);
    this.searched.set(true);
    this.lastQuery.set(q);
    const type = this.type;
    this.searchSvc.search(q, type).subscribe({
      next: (r) => { this.results.set(r.results as (SearchArticle | VeilleItem)[]); this.loading.set(false); },
      error: () => { this.results.set([]); this.loading.set(false); },
    });
  }

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }
  heading(v: VeilleItem): string { return v.title || this.sectorLabel(v.sector) || v.source || (this.fr() ? 'Veille' : 'Watch'); }
  urlsOf(v: VeilleItem): string[] { return (v.urls?.length ? v.urls : (v.url ? [v.url] : [])).map(normalizeExternalUrl).filter(Boolean); }
  hostOf(u: string): string { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }
  fmtDate(d?: string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  goLocked() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/abonnements']);
    else this.authModal.open('signup');
  }
}
