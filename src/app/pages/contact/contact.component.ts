import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../services/i18n.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  protected readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);

  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  readonly loading = signal(false);

  private fr(): boolean { return this.i18n.isFrench(); }

  onSubmit() {
    if (this.loading()) return;
    if (!this.name().trim() || !this.email().trim() || !this.message().trim()) {
      Swal.fire({
        icon: 'warning',
        title: this.fr() ? 'Champs manquants' : 'Missing fields',
        text: this.fr() ? 'Merci de remplir tous les champs.' : 'Please fill in all fields.',
        confirmButtonColor: '#1e5fd4',
      });
      return;
    }

    this.loading.set(true);
    this.http.post<{ success: boolean }>('/api/contact', {
      name: this.name().trim(),
      email: this.email().trim(),
      message: this.message().trim(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.name.set(''); this.email.set(''); this.message.set('');
        Swal.fire({
          icon: 'success',
          title: this.fr() ? 'Message envoyé !' : 'Message sent!',
          text: this.fr() ? 'Merci, nous vous répondrons rapidement.' : 'Thank you, we will get back to you shortly.',
          confirmButtonColor: '#1e5fd4',
        });
      },
      error: () => {
        this.loading.set(false);
        Swal.fire({
          icon: 'error',
          title: this.fr() ? "Échec de l'envoi" : 'Sending failed',
          text: this.fr() ? 'Veuillez réessayer dans un instant.' : 'Please try again in a moment.',
          confirmButtonColor: '#1e5fd4',
        });
      },
    });
  }
}
