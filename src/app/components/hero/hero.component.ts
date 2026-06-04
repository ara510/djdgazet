import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { NewsService } from '../../services/news.service';
import { NewsCardComponent } from '../news-card/news-card.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, NewsCardComponent],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly news = inject(NewsService);

  readonly hero = this.news.getHero();
  readonly side = this.news.getTopStories(3);

  get heroTitle(): string {
    return this.i18n.isFrench() ? this.hero.title.fr : this.hero.title.en;
  }

  get heroExcerpt(): string {
    return this.i18n.isFrench() ? this.hero.excerpt.fr : this.hero.excerpt.en;
  }

  get heroBadge(): string | null {
    if (!this.hero.badge) return null;
    return this.i18n.t('badge.' + this.hero.badge);
  }

  get categoryLabel(): string {
    return this.news.categoryLabel(this.hero.category, this.i18n.lang());
  }

  get formattedDate(): string {
    return this.news.formatDate(this.hero.publishedAt, this.i18n.lang());
  }
}
