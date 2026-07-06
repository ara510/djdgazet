import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container-news py-12 max-w-3xl">
      <h1 class="font-display font-black text-3xl md:text-4xl text-gazety-dark mb-6">{{ fr ? 'Mentions légales' : 'Legal notice' }}</h1>

      @if (fr) {
        <div class="space-y-6 text-gazety-dark leading-relaxed text-sm">
          <div><h2 class="font-display font-bold text-lg mb-1">Éditeur du site</h2>
            <p>Le site <strong>Headlines</strong> est édité par Headlines, journal d'actualité en ligne, établi à Antananarivo, Madagascar.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Contact</h2>
            <p>Pour toute demande : <a routerLink="/contact" class="text-gazety-red font-semibold hover:underline">page Contact</a>.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de Headlines.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Hébergement</h2>
            <p>Le site est hébergé par son prestataire d'hébergement. Les coordonnées complètes de l'hébergeur peuvent être communiquées sur demande.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Propriété intellectuelle</h2>
            <p>L'ensemble des contenus (textes, images, logo, mise en page) est la propriété de Headlines ou de ses partenaires. Toute reproduction sans autorisation est interdite.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Responsabilité</h2>
            <p>Headlines s'efforce d'assurer l'exactitude des informations publiées mais ne saurait être tenu responsable d'éventuelles erreurs ou omissions.</p></div>
        </div>
      } @else {
        <div class="space-y-6 text-gazety-dark leading-relaxed text-sm">
          <div><h2 class="font-display font-bold text-lg mb-1">Publisher</h2>
            <p><strong>Headlines</strong> is an online news outlet based in Antananarivo, Madagascar.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Contact</h2>
            <p>For any request: <a routerLink="/contact" class="text-gazety-red font-semibold hover:underline">Contact page</a>.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Publication director</h2>
            <p>The publication director is the legal representative of Headlines.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Hosting</h2>
            <p>The site is hosted by its hosting provider; full details are available on request.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Intellectual property</h2>
            <p>All content (text, images, logo, layout) is the property of Headlines or its partners. Reproduction without permission is prohibited.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">Liability</h2>
            <p>Headlines strives to ensure the accuracy of published information but cannot be held liable for any errors or omissions.</p></div>
        </div>
      }
    </section>
  `,
})
export class MentionsLegalesComponent {
  protected readonly i18n = inject(I18nService);
  get fr() { return this.i18n.isFrench(); }
}
