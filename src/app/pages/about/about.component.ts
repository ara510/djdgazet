import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container-news py-12 max-w-3xl">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gazety-red mb-2">{{ fr ? 'À propos' : 'About' }}</p>
      <h1 class="font-display font-black text-3xl md:text-4xl text-gazety-dark mb-6">{{ fr ? 'Qui sommes-nous ?' : 'Who we are' }}</h1>

      @if (fr) {
        <div class="space-y-4 text-gazety-dark leading-relaxed">
          <p><strong>Headlines</strong> est un journal d'actualité en ligne dédié à Madagascar. Notre mission : fournir une information <strong>fiable, vérifiée et indépendante</strong> sur la politique, l'économie, la société et les grands secteurs du pays.</p>
          <p>Au-delà de l'actualité, Headlines propose un service de <strong>veille média</strong> destiné aux professionnels et aux décideurs : suivi de la presse écrite, de la télévision, de la radio, du web et des réseaux sociaux, à Madagascar comme à l'international.</p>
          <p>Basée à Antananarivo, notre équipe s'engage à couvrir l'information avec rigueur, transparence et proximité.</p>
          <p class="text-silver-600">Une question ? <a routerLink="/contact" class="text-gazety-red font-semibold hover:underline">Contactez-nous</a>.</p>
        </div>
      } @else {
        <div class="space-y-4 text-gazety-dark leading-relaxed">
          <p><strong>Headlines</strong> is an online news outlet dedicated to Madagascar. Our mission: to deliver <strong>reliable, fact-checked and independent</strong> information on the country's politics, economy, society and key sectors.</p>
          <p>Beyond the news, Headlines offers a <strong>media watch</strong> service for professionals and decision-makers: monitoring of print, TV, radio, web and social media, in Madagascar and abroad.</p>
          <p>Based in Antananarivo, our team is committed to covering the news with rigour, transparency and closeness.</p>
          <p class="text-silver-600">A question? <a routerLink="/contact" class="text-gazety-red font-semibold hover:underline">Contact us</a>.</p>
        </div>
      }
    </section>
  `,
})
export class AboutComponent {
  protected readonly i18n = inject(I18nService);
  get fr() { return this.i18n.isFrench(); }
}
