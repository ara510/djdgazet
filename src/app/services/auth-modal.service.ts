import { Injectable, signal } from '@angular/core';

/**
 * Pilote l'ouverture de la modale d'authentification depuis n'importe où
 * (header, pages secteur, vitrine…). `null` = fermée.
 */
@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly mode = signal<'login' | 'signup' | null>(null);

  open(mode: 'login' | 'signup' = 'login') {
    this.mode.set(mode);
  }

  close() {
    this.mode.set(null);
  }
}
