import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrivacyService } from '../../services/privacy.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-privacy-modal',
  standalone: true,
  templateUrl: './privacy-modal.html',
  styleUrl: './privacy-modal.scss',
})
export class PrivacyModalComponent {
  privacy = inject(PrivacyService);
  lang    = inject(TranslationService);
  private router = inject(Router);
  closing = signal(false);

  close() {
    this.closing.set(true);
    setTimeout(() => { this.closing.set(false); this.privacy.close(); }, 300);
  }

  /** Ferme la modale et ouvre le formulaire de contact. */
  goContact() {
    this.privacy.close();
    this.router.navigate(['/contact']);
  }
}
