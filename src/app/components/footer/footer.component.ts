import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../services/i18n.service';
import { PrivacyService } from '../../services/privacy.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly privacy = inject(PrivacyService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly newsletterEmail = signal('');
  readonly sending = signal(false);

  openPrivacy() { this.privacy.open(); }

  subscribeNewsletter() {
    if (this.sending()) return;
    const email = this.newsletterEmail().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      this.toast.show(this.i18n.isFrench() ? 'Adresse email invalide.' : 'Invalid email address.', 'error');
      return;
    }
    this.sending.set(true);
    this.http.post('/api/leads', { email, kind: 'newsletter' }).subscribe({
      next: () => {
        this.sending.set(false);
        this.newsletterEmail.set('');
        this.toast.show(this.i18n.isFrench() ? 'Inscription à la newsletter confirmée !' : 'Subscribed to the newsletter!', 'success');
      },
      error: () => {
        this.sending.set(false);
        this.toast.show(this.i18n.isFrench() ? 'Inscription impossible, réessayez.' : 'Subscription failed, please retry.', 'error');
      },
    });
  }
}
