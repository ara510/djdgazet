import { Component, OnDestroy, OnInit, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Carrousel d'images auto-défilant en boucle (fondu enchaîné).
 * Une seule image → affichage statique. Plusieurs → défilement toutes les `interval` ms,
 * en boucle, avec pastilles indicatrices. Se met en pause au survol.
 */
@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full overflow-hidden" (mouseenter)="pause()" (mouseleave)="resume()">
      @for (img of images(); track img; let i = $index) {
        <img [src]="img" [alt]="alt()"
             class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
             [class.opacity-100]="i === index()" [class.opacity-0]="i !== index()"
             [attr.aria-hidden]="i !== index()" loading="lazy" />
      }
      @if (images().length > 1) {
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          @for (img of images(); track img; let i = $index) {
            <span class="w-1.5 h-1.5 rounded-full bg-white shadow transition-opacity duration-300"
                  [class.opacity-100]="i === index()" [class.opacity-50]="i !== index()"></span>
          }
        </div>
      }
    </div>
  `,
})
export class ImageCarouselComponent implements OnInit, OnDestroy {
  readonly images   = input<string[]>([]);
  readonly alt      = input<string>('');
  readonly interval = input<number>(3000);

  readonly index = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private hovered = false;

  ngOnInit()    { this.start(); }
  ngOnDestroy() { this.stop(); }

  private start() {
    this.stop();
    if (!this.hovered && this.images().length > 1) {
      // La longueur est relue à chaque tick → s'adapte si la liste change.
      this.timer = setInterval(() => this.index.update(i => (i + 1) % this.images().length), this.interval());
    }
  }
  private stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  pause()  { this.hovered = true;  this.stop(); }
  resume() { this.hovered = false; this.start(); }
}
