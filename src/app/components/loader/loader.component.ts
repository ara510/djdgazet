import { Component, Input } from '@angular/core';

/**
 * Indicateur de chargement unique du site (remplace les « Chargement… » en texte).
 * Seule exception : l'animation Lottie de la modale de connexion, conservée telle quelle.
 */
@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <span class="loader-wrap" role="status" [attr.aria-label]="label">
      <span class="loader"></span>
    </span>
  `,
  styles: [`
    .loader-wrap { display: block; width: 100%; }

    /* Uiverse — kemal_5002 */
    .loader {
      width: 48px;
      height: 48px;
      display: block;
      margin: 15px auto;
      position: relative;
      color: #6ebeff;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
    .loader::after,
    .loader::before {
      content: "";
      box-sizing: border-box;
      position: absolute;
      width: 24px;
      height: 24px;
      top: 0;
      background-color: #6ebeff;
      border-radius: 50%;
      animation: scale50 1s infinite ease-in-out;
    }
    .loader::before {
      top: auto;
      bottom: 0;
      background-color: #337ab7;
      animation-delay: 0.5s;
    }

    @keyframes rotation {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes scale50 {
      0%, 100% { transform: scale(0); }
      50%      { transform: scale(1); }
    }

    /* Accessibilité : pas d'animation si l'utilisateur la refuse — on garde une pastille fixe. */
    @media (prefers-reduced-motion: reduce) {
      .loader, .loader::after, .loader::before { animation: none; }
      .loader::after  { transform: scale(1); }
      .loader::before { transform: scale(1); opacity: 0.5; }
    }
  `],
})
export class LoaderComponent {
  /** Texte lu par les lecteurs d'écran (le visuel, lui, n'a pas de texte). */
  @Input() label = 'Chargement…';
}
