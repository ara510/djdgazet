import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article, NewsService } from '../../services/news.service';
import { I18nService } from '../../services/i18n.service';

export type NewsCardVariant = 'horizontal' | 'vertical' | 'compact' | 'large' | 'minimal';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news-card.component.html',
})
export class NewsCardComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly news = inject(NewsService);

  @Input({ required: true }) article!: Article;
  @Input() variant: NewsCardVariant = 'vertical';
  @Input() showImage = true;
  @Input() showExcerpt = true;
  @Input() showCategory = true;
  @Input() showMeta = true;

  get categoryLabel(): string {
    return this.news.categoryLabel(this.article.category, this.i18n.lang());
  }

  get formattedDate(): string {
    return this.news.formatDate(this.article.publishedAt, this.i18n.lang());
  }

  get title(): string {
    return this.i18n.isFrench() ? this.article.title.fr : this.article.title.en;
  }

  get excerpt(): string {
    return this.i18n.isFrench()
      ? this.article.excerpt.fr
      : this.article.excerpt.en;
  }

  get badgeLabel(): string | null {
    if (!this.article.badge) return null;
    return this.i18n.t('badge.' + this.article.badge);
  }
}
