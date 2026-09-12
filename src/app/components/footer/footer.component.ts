import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { PrivacyService } from '../../services/privacy.service';
import { SearchType } from '../../services/search.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly privacy = inject(PrivacyService);
  private readonly router = inject(Router);

  // Recherche (remplace l'ancienne bande newsletter).
  searchQ = '';
  searchType: SearchType = 'article';

  openPrivacy() { this.privacy.open(); }

  goSearch() {
    const q = this.searchQ.trim();
    if (!q) return;
    this.router.navigate(['/recherche'], { queryParams: { q, type: this.searchType } });
  }
}
