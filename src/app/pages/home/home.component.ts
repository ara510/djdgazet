import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { NewsService, Category } from '../../services/news.service';
import { HeroComponent } from '../../components/hero/hero.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, NewsCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly news = inject(NewsService);

  readonly featuredAfterHero = this.news.getAll().slice(4, 8);
  readonly politics = this.news.getByCategory('politics', 3);
  readonly economy = this.news.getByCategory('economy', 3);
  readonly society = this.news.getByCategory('society', 3);
  readonly culture = this.news.getByCategory('culture', 3);
  readonly sport = this.news.getByCategory('sport', 3);
  readonly environment = this.news.getByCategory('environment', 3);
  readonly opinion = this.news.getByCategory('opinion', 2);
  readonly mostRead = this.news.getMostRead(5);
  readonly premium = this.news.getPremium(4);
  readonly latest = this.news.getLatest(6);

  trackById(_: number, item: { id: string }) {
    return item.id;
  }
}
