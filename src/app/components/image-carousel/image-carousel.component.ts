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
    <div class="relative w-full h-full overflow-hidden group/car" (mouseenter)="pause()" (mouseleave)="resume()">
      @for (img of images(); track img; let i = $index) {
        <img [src]="img" [alt]="alt()"
             class="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
             [class.object-cover]="fit() === 'cover'" [class.object-contain]="fit() === 'contain'"
             [class.opacity-100]="i === index()" [class.opacity-0]="i !== index()"
             [attr.aria-hidden]="i !== index()" loading="lazy" />
      }
      @if (images().length > 1) {
        <!-- Flèches (apparaissent au survol ; sur mobile, utiliser les pastilles) -->
        <button type="button" (click)="prev($event)" aria-label="Photo précédente"
                class="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover/car:opacity-100 focus:opacity-100 hover:bg-black/70 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button type="button" (click)="next($event)" aria-label="Photo suivante"
                class="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover/car:opacity-100 focus:opacity-100 hover:bg-black/70 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <!-- Compteur -->
        <span class="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded bg-black/55 text-white text-[10px] font-semibold backdrop-blur-sm">{{ index() + 1 }}/{{ images().length }}</span>
        <!-- Pastilles cliquables -->
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          @for (img of images(); track img; let i = $index) {
            <button type="button" (click)="go(i, $event)" [attr.aria-label]="'Photo ' + (i + 1)"
                    class="w-2.5 h-2.5 rounded-full bg-white shadow transition-opacity duration-300 hover:opacity-100"
                    [class.opacity-100]="i === index()" [class.opacity-50]="i !== index()"></button>
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
  readonly fit      = input<'cover' | 'contain'>('cover');

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

  // ── Navigation manuelle (flèches + pastilles) : ne remonte pas au parent (carte cliquable). ──
  go(i: number, ev?: Event)   { ev?.stopPropagation(); this.index.set(i); this.restart(); }
  prev(ev?: Event) { ev?.stopPropagation(); const n = this.images().length; if (n) this.index.update(x => (x - 1 + n) % n); this.restart(); }
  next(ev?: Event) { ev?.stopPropagation(); const n = this.images().length; if (n) this.index.update(x => (x + 1) % n); this.restart(); }
  /** Redémarre le minuteur d'auto-défilement après une action manuelle. */
  private restart() { this.stop(); this.start(); }
}
