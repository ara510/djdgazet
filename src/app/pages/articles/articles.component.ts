import { AfterViewInit, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { slugify } from '../../utils/slug';
import { LoaderComponent } from '../../components/loader/loader.component';

/** Rubriques affichées, dans l'ordre du menu du header. */
const SECTIONS = [
  'politique', 'economie', 'international', 'social', 'environnement',
  'agriculture', 'tourisme', 'mines', 'telecoms', 'chronique', 'autre',
];

interface Group { key: string; label: string; items: ArticleItem[]; }

/**
 * Page dédiée « tous les articles », classés par rubrique (comme l'accueil). Chaque article est
 * une carte « photo d'abord » : au survol la photo bascule et laisse place au titre + extrait ;
 * le clic ouvre l'article. Les rubriques encore vides affichent une animation d'attente.
 * `/articles/:sector` ouvre la page en défilant jusqu'à la rubrique concernée.
 */
@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  template: `
    <section class="container-news py-10">
      <h1 class="font-display font-black text-3xl sm:text-4xl text-gazety-dark">
        {{ fr() ? 'Tous les articles' : 'All articles' }}
      </h1>
      <p class="text-sm text-silver-600 mt-1 mb-8">
        {{ fr() ? 'Classés par rubrique — survolez une carte pour le résumé, cliquez pour lire.'
                : 'Sorted by section — hover a card for the summary, click to read.' }}
      </p>

      @if (loading()) {
        <app-loader />
      } @else {
        @for (g of groups(); track g.key) {
          <section [id]="'rubrique-' + g.key" class="mb-12 scroll-mt-24">
            <div class="flex items-center gap-4 mb-6">
              <h2 class="font-display font-bold text-lg sm:text-xl uppercase tracking-[0.18em] text-gazety-dark whitespace-nowrap">
                {{ g.label }}
              </h2>
              @if (g.items.length) {
                <span class="text-xs text-silver-500 whitespace-nowrap">{{ g.items.length }}</span>
              }
              <span class="h-px flex-1 bg-gazety-dark/15"></span>
            </div>

            @if (g.items.length) {
              <div class="art-grid">
                @for (a of g.items; track a.id) {
                  <a class="card" [routerLink]="['/article', a.id, slug(a.title)]" [attr.aria-label]="a.title">
                    @if (a.image) {
                      <img class="card__media" [src]="a.image" [alt]="a.image_alt || a.title"
                           loading="lazy" decoding="async"
                           [style.object-position]="a.image_position || '50% 50%'" />
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 5H4V19L13.2923 9.70649C13.6828 9.31595 14.3159 9.31591 14.7065 9.70641L20 15.0104V5ZM2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z"></path></svg>
                    }
                    <div class="card__content">
                      <p class="card__title">{{ a.title }}</p>
                      <p class="card__description">{{ a.excerpt }}</p>
                      <span class="card__meta">{{ fmtDate(a.published_at) }}</span>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <!-- Rubrique encore vide : animation d'attente (machine à écrire) -->
              <div class="empty-rubrique">
                <div class="typewriter" aria-hidden="true">
                  <div class="slide"><i></i></div>
                  <div class="paper"></div>
                  <div class="keyboard"></div>
                </div>
                <p class="empty-rubrique__text">
                  {{ fr() ? 'Pas encore d\\'article pour cette rubrique.' : 'No article in this section yet.' }}
                </p>
              </div>
            }
          </section>
        }
      }
    </section>
  `,
  styles: [`
    .art-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.6rem;
    }

    /* Carte « photo d'abord », le contenu bascule au survol (adaptée de Uiverse — gharsh11032000).
       Couleurs branchées sur les variables de thème pour suivre le mode sombre. */
    .card {
      position: relative;
      width: 100%;
      height: 200px;
      background-color: var(--color-bg);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      perspective: 1000px;
      box-shadow: 0 0 0 1px var(--color-border);
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-decoration: none;
    }

    .card svg { width: 48px; fill: var(--color-ink-muted); transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .card__media { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card:hover { transform: scale(1.05); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); }

    .card__content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 18px;
      box-sizing: border-box;
      background-color: var(--color-surface);
      transform: rotateX(-90deg);
      transform-origin: bottom;
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
    }

    .card:hover .card__content { transform: rotateX(0deg); }
    .card:hover svg { scale: 0; }

    .card__title {
      margin: 0;
      font-family: "Playfair Display", Georgia, serif;
      font-size: 19px;
      line-height: 1.25;
      color: var(--color-ink);
      font-weight: 700;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card__description {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--color-ink-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card__meta {
      margin-top: auto;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-accent);
    }

    /* Sans survol possible (tactile) : on montre directement le texte sous la photo. */
    @media (hover: none) {
      .card { height: auto; flex-direction: column; align-items: stretch; }
      .card__media { height: 150px; }
      .card__content { position: static; transform: none; height: auto; min-height: 120px; }
    }

    /* ── Rubrique vide : animation machine à écrire (Uiverse — Nawsome) ── */
    .empty-rubrique {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
      padding: 2.5rem 1rem 1.5rem;
      border: 1px dashed var(--color-border);
      border-radius: 10px;
    }
    .empty-rubrique__text {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-ink-muted);
      text-align: center;
    }

    .typewriter {
      --blue: #5C86FF;
      --blue-dark: #275EFE;
      --key: #fff;
      --paper: #EEF0FD;
      --text: #D3D4EC;
      --tool: #FBC56C;
      --duration: 3s;
      position: relative;
      animation: bounce05 var(--duration) linear infinite;
    }

    .typewriter .slide {
      width: 92px;
      height: 20px;
      border-radius: 3px;
      margin-left: 14px;
      transform: translateX(14px);
      background: linear-gradient(var(--blue), var(--blue-dark));
      animation: slide05 var(--duration) ease infinite;
    }

    .typewriter .slide:before, .typewriter .slide:after,
    .typewriter .slide i:before { content: ""; position: absolute; background: var(--tool); }

    .typewriter .slide:before { width: 2px; height: 8px; top: 6px; left: 100%; }
    .typewriter .slide:after { left: 94px; top: 3px; height: 14px; width: 6px; border-radius: 3px; }
    .typewriter .slide i { display: block; position: absolute; right: 100%; width: 6px; height: 4px; top: 4px; background: var(--tool); }
    .typewriter .slide i:before { right: 100%; top: -2px; width: 4px; border-radius: 2px; height: 14px; }

    .typewriter .paper {
      position: absolute;
      left: 24px;
      top: -26px;
      width: 40px;
      height: 46px;
      border-radius: 5px;
      background: var(--paper);
      transform: translateY(46px);
      animation: paper05 var(--duration) linear infinite;
    }

    .typewriter .paper:before {
      content: "";
      position: absolute;
      left: 6px;
      right: 6px;
      top: 7px;
      border-radius: 2px;
      height: 4px;
      transform: scaleY(0.8);
      background: var(--text);
      box-shadow: 0 12px 0 var(--text), 0 24px 0 var(--text), 0 36px 0 var(--text);
    }

    .typewriter .keyboard { width: 120px; height: 56px; margin-top: -10px; z-index: 1; position: relative; }
    .typewriter .keyboard:before, .typewriter .keyboard:after { content: ""; position: absolute; }

    .typewriter .keyboard:before {
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 7px;
      background: linear-gradient(135deg, var(--blue), var(--blue-dark));
      transform: perspective(10px) rotateX(2deg);
      transform-origin: 50% 100%;
    }

    .typewriter .keyboard:after {
      left: 2px; top: 25px; width: 11px; height: 4px; border-radius: 2px;
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
      animation: keyboard05 var(--duration) linear infinite;
    }

    @keyframes bounce05 {
      85%, 92%, 100% { transform: translateY(0); }
      89% { transform: translateY(-4px); }
      95% { transform: translateY(2px); }
    }

    @keyframes slide05 {
      5% { transform: translateX(14px); }
      15%, 30% { transform: translateX(6px); }
      40%, 55% { transform: translateX(0); }
      65%, 70% { transform: translateX(-4px); }
      80%, 89% { transform: translateX(-12px); }
      100% { transform: translateX(14px); }
    }

    @keyframes paper05 {
      5% { transform: translateY(46px); }
      20%, 30% { transform: translateY(34px); }
      40%, 55% { transform: translateY(22px); }
      65%, 70% { transform: translateY(10px); }
      80%, 85% { transform: translateY(0); }
      92%, 100% { transform: translateY(46px); }
    }

    @keyframes keyboard05 {
      5%, 12%, 21%, 30%, 39%, 48%, 57%, 66%, 75%, 84% {
        box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
      }
      9% { box-shadow: 15px 2px 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      18% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 2px 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      27% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 12px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      36% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 12px 0 var(--key), 60px 12px 0 var(--key), 68px 12px 0 var(--key), 83px 10px 0 var(--key); }
      45% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 2px 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      54% { box-shadow: 15px 0 0 var(--key), 30px 2px 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      63% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 12px 0 var(--key); }
      72% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 2px 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
      81% { box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 12px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key); }
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .card__content, .card svg { transition: none; }
      .typewriter, .typewriter .slide, .typewriter .paper, .typewriter .keyboard:after { animation: none; }
    }
  `],
})
export class ArticlesComponent implements AfterViewInit {
  private readonly i18n = inject(I18nService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly route = inject(ActivatedRoute);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly articles = signal<ArticleItem[]>([]);
  readonly loading = signal(true);

  /** Toutes les rubriques, dans l'ordre du menu — y compris celles sans article. */
  readonly groups = computed<Group[]>(() => {
    const all = this.articles();
    return SECTIONS.map(key => ({
      key,
      label: this.i18n.t('sector.' + key),
      items: all.filter(a => a.sector === key),
    }));
  });

  constructor() {
    this.articlesSvc.list().subscribe({
      next: rows => { this.articles.set(rows); this.loading.set(false); this.scrollToSector(); },
      error: () => { this.articles.set([]); this.loading.set(false); },
    });
  }

  ngAfterViewInit() { this.scrollToSector(); }

  /** `/articles/:sector` : on ouvre la page entière et on défile jusqu'à la rubrique demandée. */
  private scrollToSector() {
    const key = this.route.snapshot.paramMap.get('sector');
    if (!key || this.loading()) return;
    setTimeout(() => document.getElementById('rubrique-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  slug(title?: string | null): string { return slugify(title); }

  fmtDate(d?: string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
