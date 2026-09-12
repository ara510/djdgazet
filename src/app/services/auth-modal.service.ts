import { Injectable, signal } from '@angular/core';

/**
 * Pilote l'ouverture de la modale d'authentification depuis n'importe où
 * (header, pages secteur, vitrine…). `null` = fermée.
 */
@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly mode = signal<'login' | 'signup' | null>(null);
  /** Jeton d'invitation admin (lien envoyé au boss). Injecté dans l'inscription si présent. */
  readonly inviteToken = signal<string | null>(null);
  /** Jeton de réinitialisation de mot de passe (lien ?reset=… reçu par email). */
  readonly resetToken = signal<string | null>(null);

  open(mode: 'login' | 'signup' = 'login') {
    this.mode.set(mode);
  }

  close() {
    this.mode.set(null);
  }
}
