import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { I18nService } from '../../services/i18n.service';
import { NewsService, Article } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, NewsCardComponent],
  templateUrl: './article.component.html',
})
export class ArticleComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly news = inject(NewsService);
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly idParam = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly article = computed<Article | undefined>(() =>
    this.news.getById(this.idParam())
  );

  readonly related = computed<Article[]>(() => {
    const current = this.article();
    if (!current) return [];
    return this.news
      .getByCategory(current.category)
      .filter((a) => a.id !== current.id)
      .slice(0, 3);
  });

  readonly isLocked = computed(() => {
    const a = this.article();
    if (!a) return false;
    return a.premium && this.auth.tier() === 'general';
  });

  title(a: Article): string {
    return this.i18n.isFrench() ? a.title.fr : a.title.en;
  }

  excerpt(a: Article): string {
    return this.i18n.isFrench() ? a.excerpt.fr : a.excerpt.en;
  }

  categoryLabel(a: Article): string {
    return this.news.categoryLabel(a.category, this.i18n.lang());
  }

  formattedDate(a: Article): string {
    return this.news.formatDate(a.publishedAt, this.i18n.lang());
  }
}
