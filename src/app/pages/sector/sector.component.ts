import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { VeilleService } from '../../services/veille.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { VeilleIconComponent } from '../../components/veille-icon/veille-icon';

interface SectorVeille {
  id: number;
  title: string | null;
  excerpt?: string;
  source?: string | null;
  source_type?: string | null;
  source_types?: string[] | null;
  social_network?: string | null;
  social_networks?: string[] | null;
  sectors?: string[] | null;
  published_at?: string;
  locked: boolean;
  tier: 'sectorielle' | 'dediee';
}

const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  presse: { fr: 'Presse', en: 'Press' },
  web:    { fr: 'Web', en: 'Web' },
  social: { fr: 'Réseaux', en: 'Social' },
  radio:  { fr: 'Radio', en: 'Radio' },
  tv:     { fr: 'TV', en: 'TV' },
  institution: { fr: 'Institution', en: 'Institution' },
};
const NETWORK_LABELS: Record<string, string> = {
  facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn',
};
interface SectorGroup { key: string; items: SectorVeille[]; }

/** Quota découverte du plan Générale : 6 lectures / 10 jours (politique, économie, social). */
interface SectorQuota {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string | null;
  readIds: number[];
}

interface SectorResponse {
  sector: string;
  loggedIn: boolean;
  level: number;
  groups: SectorGroup[];
  quota?: SectorQuota | null;
}

@Component({
  selector: 'app-sector',
  standalone: true,
  imports: [CommonModule, RouterLink, VeilleIconComponent],
  templateUrl: './sector.component.html',
  styleUrl: './sector.component.scss',
})
export class SectorComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);
  private readonly veille = inject(VeilleService);

  signup() {
    this.authModal.open('signup');
  }

  /** Clic sur un aperçu : accessible → ouvre le tableau de bord sur cette veille ;
   *  sinon visiteur → inscription, gratuit → abonnements. */
  openVeille(v: SectorVeille) {
    if (!v.locked) {
      this.veille.openItem(v.id);
    } else if (this.loggedIn()) {
      this.router.navigate(['/abonnements']);
    } else {
      this.authModal.open('signup');
    }
  }

  readonly sector = signal('');
  readonly loading = signal(true);
  readonly groups = signal<SectorGroup[]>([]);
  readonly loggedIn = signal(false);
  readonly quota = signal<SectorQuota | null>(null);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly sectorLabel = computed(() => this.i18n.t('sector.' + this.sector()));
  readonly hasAny = computed(() => this.groups().some(g => g.items.length > 0));
  readonly hasLocked = computed(() => this.groups().some(g => g.items.some(v => v.locked)));
  readonly articles = signal<ArticleItem[]>([]);

  constructor() {
    this.route.paramMap.subscribe(p => {
      const slug = p.get('slug') ?? '';
      this.sector.set(slug);
      this.loadArticles(slug);
      this.loadVeilles(slug);
    });

    // À la fermeture du dashboard, une lecture a pu consommer le quota découverte :
    // on recharge pour mettre à jour le compteur et les verrous.
    let wasOpen = false;
    effect(() => {
      const open = this.veille.isOpen();
      if (wasOpen && !open && this.quota()) this.loadVeilles(this.sector());
      wasOpen = open;
    });
  }

  private loadArticles(slug: string) {
    this.articlesSvc.list(slug).subscribe({
      next: rows => this.articles.set(rows),
      error: () => this.articles.set([]),
    });
  }

  private loadVeilles(slug: string) {
    this.loading.set(true);
    const token = this.auth.token();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    this.http.get<SectorResponse>(`/api/veille/sector/${slug}`, { headers }).subscribe({
      next: (res) => {
        this.groups.set((res.groups ?? []).filter(g => g.items.length > 0));
        this.loggedIn.set(res.loggedIn);
        this.quota.set(res.quota ?? null);
        this.loading.set(false);
      },
      error: () => { this.groups.set([]); this.quota.set(null); this.loading.set(false); },
    });
  }

  groupLabel(key: string): string {
    const fr = this.fr();
    switch (key) {
      case 'recent': return fr ? 'Récentes' : 'Recent';
      case 'd3':     return fr ? 'Il y a ~3 jours' : '~3 days ago';
      case 'd5':     return fr ? 'Il y a ~5 jours' : '~5 days ago';
      default:       return '';
    }
  }

  typeLabel(t?: string | null): string {
    if (!t) return '';
    const m = TYPE_LABELS[t];
    return m ? (this.fr() ? m.fr : m.en) : t;
  }

  /** Types de source de la veille (tableau, avec repli sur le champ unique). */
  typesOf(v: SectorVeille): string[] {
    return (v.source_types?.length ? v.source_types : (v.source_type ? [v.source_type] : [])).filter(Boolean) as string[];
  }

  /** Réseaux sociaux de la veille (tableau, avec repli sur le champ unique). */
  networksOf(v: SectorVeille): string[] {
    return (v.social_networks?.length ? v.social_networks : (v.social_network ? [v.social_network] : [])).filter(Boolean) as string[];
  }

  networkLabel(n?: string | null): string {
    return n ? (NETWORK_LABELS[n] ?? n) : '';
  }

  /** Texte brut extrait de la description HTML d'un article (pour l'aperçu des cartes). */
  articleExcerpt(html?: string | null, len = 150): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').replace(/\s+/g, ' ').trim().slice(0, len);
  }

  /** Titre affiché : le titre de la veille, sinon le libellé du secteur. */
  cardTitle(v: SectorVeille): string {
    return v.title?.trim() || this.sectorLabel();
  }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /** Date de remise à zéro du quota découverte (fenêtre de 10 jours). */
  quotaResetLabel(): string {
    const q = this.quota();
    if (!q?.resetAt) return '';
    return this.formatDate(q.resetAt);
  }
}
