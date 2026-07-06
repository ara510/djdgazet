import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { isoToFr, frToIso } from '../../utils/date-fr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly fr = computed(() => this.i18n.isFrench());

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  // ── Formulaire d'édition ──────────────────────────────────────────────
  readonly fNom = signal('');
  readonly fPrenoms = signal('');
  readonly fEmail = signal('');
  readonly fUsername = signal('');
  readonly fDate = signal('');
  readonly fTel = signal('');
  readonly fPays = signal('');
  readonly fVille = signal('');
  readonly fGenre = signal('');
  readonly fNotif = signal(true);
  readonly fAvatar = signal<string | null>(null);
  readonly fCurrentPwd = signal('');
  readonly fNewPwd = signal('');

  // ── OTP (email non vérifié) ───────────────────────────────────────────
  readonly otpSending = signal(false);
  readonly otpStep = signal(false);
  readonly otpCode = signal('');
  readonly otpVerifying = signal(false);
  readonly otpMessage = signal('');
  readonly otpError = signal('');

  readonly planLabel = computed(() => {
    switch (this.auth.currentUser()?.plan) {
      case 'dediee':      return this.fr() ? 'Dédiée' : 'Dedicated';
      case 'sectorielle': return this.fr() ? 'Sectorielle' : 'Sectorial';
      default:            return this.fr() ? 'Générale' : 'General';
    }
  });

  readonly initials = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return ((u.prenoms?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase() || (u.username?.[0] ?? '?').toUpperCase();
  });

  /** Avatar affiché : preview en édition, sinon celui du compte. */
  readonly avatarSrc = computed(() => this.editing() ? this.fAvatar() : (this.auth.currentUser()?.avatar ?? null));

  formatDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  startEdit() {
    const u = this.auth.currentUser();
    if (!u) return;
    this.fNom.set(u.nom ?? '');
    this.fPrenoms.set(u.prenoms ?? '');
    this.fEmail.set(u.email ?? '');
    this.fUsername.set(u.username ?? '');
    this.fDate.set(isoToFr(u.date_naissance));
    this.fTel.set(u.telephone ?? '');
    this.fPays.set(u.pays ?? '');
    this.fVille.set(u.ville ?? '');
    this.fGenre.set(u.genre ?? '');
    this.fNotif.set(u.notif_email ?? true);
    this.fAvatar.set(u.avatar ?? null);
    this.fCurrentPwd.set('');
    this.fNewPwd.set('');
    this.error.set('');
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
    this.error.set('');
  }

  /** Sélection d'une photo → redimensionnée et convertie en data URL (base64). */
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set(this.fr() ? 'Veuillez choisir une image.' : 'Please choose an image.');
      return;
    }
    this.resizeImage(file, 256)
      .then(dataUrl => this.fAvatar.set(dataUrl))
      .catch(() => this.error.set(this.fr() ? "Impossible de lire l'image." : 'Could not read the image.'));
  }

  removeAvatar() {
    this.fAvatar.set(null);
  }

  private resizeImage(file: File, max: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > max) { height = Math.round(height * max / width); width = max; }
          else if (height >= width && height > max) { width = Math.round(width * max / height); height = max; }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no ctx'));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  save() {
    if (this.saving()) return;
    this.error.set('');

    const dobIso = frToIso(this.fDate());
    if (!this.fPrenoms().trim() || !this.fNom().trim() || !this.fEmail().trim() || !this.fUsername().trim() || !dobIso) {
      this.error.set(this.fr() ? 'Nom, prénoms, email, identifiant et date (jj/mm/aaaa) sont requis.' : 'Name, email, username and date (dd/mm/yyyy) are required.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(this.fUsername().trim())) {
      this.error.set(this.fr() ? "L'identifiant ne peut contenir que des lettres et des chiffres." : 'Username may only contain letters and digits.');
      return;
    }
    if (this.fNewPwd() && !this.fCurrentPwd()) {
      this.error.set(this.fr() ? 'Mot de passe actuel requis pour en définir un nouveau.' : 'Current password required to set a new one.');
      return;
    }

    const payload: Record<string, unknown> = {
      nom: this.fNom().trim(),
      prenoms: this.fPrenoms().trim(),
      email: this.fEmail().trim(),
      username: this.fUsername().trim(),
      date_naissance: dobIso,
      avatar: this.fAvatar(),
      telephone: this.fTel().trim() || null,
      pays: this.fPays().trim() || null,
      ville: this.fVille().trim() || null,
      genre: this.fGenre() || null,
      notif_email: this.fNotif(),
    };
    if (this.fNewPwd()) {
      payload['currentPassword'] = this.fCurrentPwd();
      payload['newPassword'] = this.fNewPwd();
    }

    this.saving.set(true);
    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.toast.show(this.fr() ? 'Profil mis à jour.' : 'Profile updated.', 'success');
      },
      error: (e) => {
        this.saving.set(false);
        this.toast.show(e.error?.error || (this.fr() ? 'Mise à jour impossible.' : 'Update failed.'), 'error');
      },
    });
  }

  /** Envoie le code et ouvre le champ de saisie. */
  resendOtp() {
    if (this.otpSending()) return;
    this.otpSending.set(true);
    this.otpMessage.set('');
    this.otpError.set('');
    this.auth.sendEmailOtp().subscribe({
      next: () => {
        this.otpSending.set(false);
        this.otpStep.set(true);
        this.otpMessage.set(this.fr() ? 'Code envoyé. Saisissez-le ci-dessous.' : 'Code sent. Enter it below.');
      },
      error: (e) => {
        this.otpSending.set(false);
        this.otpError.set(e.error?.error || (this.fr() ? 'Envoi impossible.' : 'Could not send.'));
      },
    });
  }

  /** Valide le code saisi → marque l'email vérifié. */
  verifyOtp() {
    if (this.otpVerifying()) return;
    const code = this.otpCode().trim();
    if (!code) {
      this.otpError.set(this.fr() ? 'Saisissez le code reçu.' : 'Enter the code you received.');
      return;
    }
    this.otpVerifying.set(true);
    this.otpError.set('');
    this.auth.verifyEmailOtp(code).subscribe({
      next: () => {
        this.otpVerifying.set(false);
        this.otpStep.set(false);
        this.otpCode.set('');
        this.otpMessage.set('');
        this.toast.show(this.fr() ? 'Email vérifié ✓' : 'Email verified ✓', 'success');
      },
      error: (e) => {
        this.otpVerifying.set(false);
        this.otpError.set(e.error?.error || (this.fr() ? 'Code invalide ou expiré.' : 'Invalid or expired code.'));
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
