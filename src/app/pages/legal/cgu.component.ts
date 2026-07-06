import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-cgu',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container-news py-12 max-w-3xl">
      <h1 class="font-display font-black text-3xl md:text-4xl text-gazety-dark mb-6">
        {{ fr ? "Conditions générales d'utilisation" : 'Terms of use' }}
      </h1>

      @if (fr) {
        <div class="space-y-6 text-gazety-dark leading-relaxed text-sm">
          <div><h2 class="font-display font-bold text-lg mb-1">1. Objet</h2>
            <p>Les présentes conditions régissent l'utilisation du site Headlines et des services associés (lecture d'articles, veille média, abonnements).</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">2. Accès au service</h2>
            <p>La consultation d'un aperçu des contenus est libre. La lecture complète des articles nécessite la création d'un compte gratuit. Certaines veilles sont réservées aux abonnements payants.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">3. Compte utilisateur</h2>
            <p>L'utilisateur s'engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants. Il est responsable des activités effectuées depuis son compte.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">4. Abonnements</h2>
            <p>Les offres et tarifs sont présentés sur la page <a routerLink="/abonnements" class="text-gazety-red font-semibold hover:underline">Abonnements</a>. L'accès aux contenus payants dépend de l'abonnement souscrit.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">5. Propriété intellectuelle</h2>
            <p>Les contenus publiés sont protégés. Toute reproduction, diffusion ou réutilisation non autorisée est interdite.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">6. Responsabilité</h2>
            <p>Headlines ne saurait être tenu responsable d'une indisponibilité temporaire du service ou d'erreurs dans les contenus.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">7. Modification</h2>
            <p>Headlines peut modifier les présentes conditions à tout moment. La version en vigueur est celle publiée sur le site.</p></div>
        </div>
      } @else {
        <div class="space-y-6 text-gazety-dark leading-relaxed text-sm">
          <div><h2 class="font-display font-bold text-lg mb-1">1. Purpose</h2>
            <p>These terms govern the use of the Headlines website and associated services (reading articles, media watch, subscriptions).</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">2. Access</h2>
            <p>Previewing content is free. Reading full articles requires a free account. Some watch content is reserved for paid subscriptions.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">3. User account</h2>
            <p>Users agree to provide accurate information and keep their credentials confidential. They are responsible for activity on their account.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">4. Subscriptions</h2>
            <p>Plans and pricing are shown on the <a routerLink="/abonnements" class="text-gazety-red font-semibold hover:underline">Subscriptions</a> page. Access to paid content depends on the chosen plan.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">5. Intellectual property</h2>
            <p>Published content is protected. Any unauthorised reproduction, distribution or reuse is prohibited.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">6. Liability</h2>
            <p>Headlines cannot be held liable for temporary service unavailability or content errors.</p></div>
          <div><h2 class="font-display font-bold text-lg mb-1">7. Changes</h2>
            <p>Headlines may amend these terms at any time. The version in force is the one published on the site.</p></div>
        </div>
      }
    </section>
  `,
})
export class CguComponent {
  protected readonly i18n = inject(I18nService);
  get fr() { return this.i18n.isFrench(); }
}
