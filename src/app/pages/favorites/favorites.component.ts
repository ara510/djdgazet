import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { VeilleService } from '../../services/veille.service';
import { ArticleService, ArticleItem, FavoriteVeille } from '../../services/article.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly veille = inject(VeilleService);
  private readonly articlesSvc = inject(ArticleService);

  readonly fr = computed(() => this.i18n.isFrench());
  readonly loading = signal(true);
  readonly articles = signal<ArticleItem[]>([]);
  readonly veilles = signal<FavoriteVeille[]>([]);

  constructor() {
    this.reload();
  }

  reload() {
    if (!this.auth.isLoggedIn()) { this.loading.set(false); return; }
    this.loading.set(true);
    this.articlesSvc.favorites().subscribe({
      next: r => { this.articles.set(r.articles ?? []); this.veilles.set(r.veilles ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  openVeille(v: FavoriteVeille) {
    this.veille.openItem(v.id);
  }

  removeArticle(a: ArticleItem, ev: Event) {
    ev.preventDefault(); ev.stopPropagation();
    this.articlesSvc.toggleFavorite(a.id, false).subscribe({
      next: () => { this.articles.update(list => list.filter(x => x.id !== a.id)); this.toast.show(this.fr() ? 'Retiré des favoris' : 'Removed', 'success'); },
      error: () => this.toast.show(this.fr() ? 'Action impossible.' : 'Failed.', 'error'),
    });
  }

  removeVeille(v: FavoriteVeille, ev: Event) {
    ev.preventDefault(); ev.stopPropagation();
    this.veille.setState(v.id, { favorite: false }).subscribe({
      next: () => { this.veilles.update(list => list.filter(x => x.id !== v.id)); this.toast.show(this.fr() ? 'Retiré des favoris' : 'Removed', 'success'); },
      error: () => this.toast.show(this.fr() ? 'Action impossible.' : 'Failed.', 'error'),
    });
  }
}
