import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { VeillePublicComponent } from '../../components/veille-public/veille-public';
import { AuthService } from '../../services/auth.service';
import { VeilleService } from '../../services/veille.service';
import { I18nService } from '../../services/i18n.service';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-veille-showcase',
  standalone: true,
  imports: [VeillePublicComponent],
  template: `
    @if (!auth.isLoggedIn() && !auth.token()) {
      <!-- Visiteur sans compte : aperçu public limité -->
      <app-veille-public (openAuth)="onAuth()" />
    } @else {
      <!-- Connecté (ou en cours) : pas d'aperçu, on bascule vers le tableau de bord -->
      <div class="container-news py-24 text-center text-silver-600">
        {{ i18n.isFrench() ? 'Ouverture de votre veille…' : 'Opening your watch…' }}
      </div>
    }
  `,
})
export class VeilleShowcaseComponent {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly veille = inject(VeilleService);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);

  constructor() {
    // Les utilisateurs connectés ne voient pas l'aperçu public : on les amène
    // directement au tableau de bord (bouton « Veille »).
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/']);
        this.veille.open();
      }
    });
  }

  /** L'aperçu public demande l'inscription → on ouvre la modale d'inscription. */
  onAuth() {
    this.authModal.open('signup');
  }
}
