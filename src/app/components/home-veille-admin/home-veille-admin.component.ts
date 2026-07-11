import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeVeilleService, HomeVeilleCandidate, HomeScale } from '../../services/home-veille.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';

/**
 * Modale admin : pilote la section « Veille média » de l'accueil.
 * Toutes les veilles taguées « Actualité » s'y affichent en intégralité ; l'admin
 * règle l'activation, le mode (toutes / sélection), l'ordre (position), le nombre
 * et l'échelle (taille des cartes).
 */
@Component({
  selector: 'app-home-veille-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
      <div class="relative w-full max-w-xl bg-white rounded-lg shadow-xl border border-silver-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-silver-200 sticky top-0 bg-white z-10">
          <h2 class="font-display font-bold text-lg text-gazety-dark">
            {{ fr ? 'Veilles de l’accueil' : 'Home watch items' }}
          </h2>
          <button (click)="close()" class="p-1.5 rounded hover:bg-silver-100 text-silver-500" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 py-4 space-y-5">
          <p class="text-sm text-silver-600">
            {{ fr
              ? 'La section « Veille média » de l’accueil affiche les veilles taguées « Actualité » en intégralité. Vous pouvez aussi choisir des veilles d’autres secteurs. Réglez ci-dessous leur affichage.'
              : 'The home “Media watch” section shows watch items tagged “News” in full. You can also pick items from other sectors. Configure their display below.' }}
          </p>

          <!-- Activation -->
          <label class="flex items-center justify-between gap-3 py-2 px-3 rounded border border-silver-200 cursor-pointer">
            <span class="text-sm font-semibold text-gazety-dark">{{ fr ? 'Afficher la section sur l’accueil' : 'Show the section on home' }}</span>
            <input type="checkbox" [ngModel]="enabled()" (ngModelChange)="enabled.set($event)" class="h-5 w-5 accent-gazety-red cursor-pointer" />
          </label>

          <!-- Mode -->
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-2">{{ fr ? 'Quelles veilles afficher' : 'Which items to show' }}</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" (click)="mode.set('all')"
                [class]="modeBtn('all')">
                {{ fr ? 'Actualités + ma sélection' : 'News + my selection' }}
              </button>
              <button type="button" (click)="mode.set('pick')"
                [class]="modeBtn('pick')">
                {{ fr ? 'Seulement ma sélection' : 'Only my selection' }}
              </button>
            </div>
            <p class="text-xs text-silver-500 mt-1.5">
              {{ mode() === 'pick'
                ? (fr ? 'Seules les veilles cochées ci-dessous seront affichées (tous secteurs).' : 'Only the checked items below will be shown (any sector).')
                : (fr ? 'Toutes les actualités sont affichées ; les veilles cochées (tous secteurs) sont ajoutées et mises en avant.' : 'All news items are shown; checked items (any sector) are added and featured first.') }}
            </p>
          </div>

          <!-- Nombre + échelle -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-1.5">{{ fr ? 'Nombre max (0 = toutes)' : 'Max count (0 = all)' }}</label>
              <input type="number" min="0" max="100" [ngModel]="count()" (ngModelChange)="count.set(+$event || 0)"
                class="w-full rounded border border-silver-300 px-3 py-2 text-sm focus:border-gazety-dark focus:outline-none" />
            </div>
            <div>
              <span class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-1.5">{{ fr ? 'Échelle des cartes' : 'Card scale' }}</span>
              <div class="flex gap-1.5">
                @for (s of scales; track s.value) {
                  <button type="button" (click)="scale.set(s.value)" [class]="scaleBtn(s.value)">{{ fr ? s.fr : s.en }}</button>
                }
              </div>
            </div>
          </div>

          <!-- Ordre de la sélection -->
          @if (selectedCards().length) {
            <div>
              <span class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-2">
                {{ fr ? 'Ordre d’affichage (position)' : 'Display order (position)' }}
              </span>
              <ol class="space-y-1.5">
                @for (c of selectedCards(); track c.id; let i = $index) {
                  <li class="flex items-center gap-2 py-1.5 px-2.5 rounded border border-silver-200 bg-silver-50">
                    <span class="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-gazety-dark text-white text-[11px] font-bold">{{ i + 1 }}</span>
                    <span class="flex-1 text-sm text-gazety-dark truncate">{{ titleOf(c) }}</span>
                    <button type="button" (click)="moveUp(i)" [disabled]="i === 0" class="p-1 rounded hover:bg-silver-200 disabled:opacity-30" aria-label="Monter">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button type="button" (click)="moveDown(i)" [disabled]="i === selectedCards().length - 1" class="p-1 rounded hover:bg-silver-200 disabled:opacity-30" aria-label="Descendre">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button type="button" (click)="toggle(c.id)" class="p-1 rounded hover:bg-gazety-red/10 text-gazety-red" aria-label="Retirer">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </li>
                }
              </ol>
            </div>
          }

          <!-- Liste des candidates -->
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wide text-silver-500 mb-2">
              {{ fr ? 'Veilles disponibles (tous secteurs)' : 'Available items (any sector)' }}
            </span>
            @if (loading()) {
              <p class="text-sm text-silver-500">{{ fr ? 'Chargement…' : 'Loading…' }}</p>
            } @else if (candidates().length === 0) {
              <p class="text-sm text-silver-500">{{ fr ? 'Aucune veille publiée pour le moment.' : 'No published item yet.' }}</p>
            } @else {
              <div class="max-h-64 overflow-y-auto rounded border border-silver-200 divide-y divide-silver-100">
                @for (c of candidates(); track c.id) {
                  <label class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-silver-50">
                    <input type="checkbox" [checked]="isSelected(c.id)" (change)="toggle(c.id)" class="h-4 w-4 accent-gazety-red cursor-pointer shrink-0" />
                    @if (c.image) { <img [src]="c.image" alt="" class="w-10 h-10 rounded object-cover shrink-0" loading="lazy" /> }
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm text-gazety-dark truncate">{{ titleOf(c) }}</span>
                      <span class="flex flex-wrap items-center gap-1.5 mt-0.5">
                        @for (l of labelsOf(c); track l) {
                          <span class="px-1.5 py-0.5 rounded bg-gazety-dark/5 text-gazety-dark text-[10px] font-semibold uppercase tracking-wide">{{ l }}</span>
                        }
                        <span class="text-[11px] text-silver-500">{{ c.published_at | date:'dd/MM/yy' }}@if (c.pinned) { · {{ fr ? 'épinglée' : 'pinned' }} }</span>
                      </span>
                    </span>
                  </label>
                }
              </div>
            }
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-silver-200 sticky bottom-0 bg-white">
          <button (click)="close()" class="px-4 py-2 text-sm font-semibold text-silver-600 rounded hover:bg-silver-100">
            {{ fr ? 'Annuler' : 'Cancel' }}
          </button>
          <button (click)="save()" [disabled]="svc.saving()"
            class="px-4 py-2 text-sm font-semibold bg-gazety-dark text-white rounded hover:bg-gazety-dark/90 disabled:opacity-60">
            {{ svc.saving() ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HomeVeilleAdminComponent implements OnInit {
  protected readonly svc = inject(HomeVeilleService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  get fr(): boolean { return this.i18n.isFrench(); }

  readonly enabled = signal(true);
  readonly mode    = signal<'all' | 'pick'>('all');
  readonly count   = signal(0);
  readonly scale   = signal<HomeScale>('normal');
  readonly ids     = signal<number[]>([]);

  readonly candidates = signal<HomeVeilleCandidate[]>([]);
  readonly loading    = signal(true);

  readonly scales: { value: HomeScale; fr: string; en: string }[] = [
    { value: 'compact', fr: 'Compact', en: 'Compact' },
    { value: 'normal',  fr: 'Normal',  en: 'Normal'  },
    { value: 'grand',   fr: 'Grand',   en: 'Large'   },
  ];

  /** Veilles sélectionnées, résolues dans l'ordre choisi. */
  readonly selectedCards = computed(() => {
    const map = new Map(this.candidates().map(c => [c.id, c]));
    return this.ids().map(id => map.get(id)).filter((c): c is HomeVeilleCandidate => !!c);
  });

  ngOnInit() {
    this.svc.getSettings().subscribe({
      next: s => {
        this.enabled.set(s.enabled);
        this.mode.set(s.mode);
        this.count.set(s.count);
        this.scale.set(s.scale);
        this.ids.set(s.ids || []);
      },
      error: () => {},
    });
    this.svc.getCandidates().subscribe({
      next: rows => { this.candidates.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  titleOf(c: HomeVeilleCandidate): string { return c.title || (this.fr ? '(sans titre)' : '(untitled)'); }

  readonly tagLabels: Record<string, { fr: string; en: string }> = {
    actualite:     { fr: 'Actualité',     en: 'News'     },
    fait_marquant: { fr: 'Fait marquant', en: 'Key fact' },
  };
  tagLabel(t?: string | null): string { const o = t ? this.tagLabels[t] : null; return o ? (this.fr ? o.fr : o.en) : ''; }
  sectorLabel(s?: string | null): string { return s ? this.i18n.t('sector.' + s) : ''; }
  /** Étiquettes (tags + secteurs) d'une candidate, pour situer sa nature. */
  labelsOf(c: HomeVeilleCandidate): string[] {
    const out: string[] = [];
    (c.tags || []).forEach(t => { const l = this.tagLabel(t); if (l) out.push(l); });
    (c.sectors || []).forEach(s => { const l = this.sectorLabel(s); if (l) out.push(l); });
    return out;
  }

  isSelected(id: number): boolean { return this.ids().includes(id); }
  toggle(id: number) { this.ids.update(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]); }
  moveUp(i: number)   { this.ids.update(l => { if (i <= 0) return l; const c = [...l]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; }); }
  moveDown(i: number) { this.ids.update(l => { if (i >= l.length - 1) return l; const c = [...l]; [c[i], c[i + 1]] = [c[i + 1], c[i]]; return c; }); }

  modeBtn(m: 'all' | 'pick'): string {
    const base = 'px-3 py-2 text-sm font-semibold rounded border transition-colors ';
    return base + (this.mode() === m
      ? 'bg-gazety-dark text-white border-gazety-dark'
      : 'bg-white text-silver-600 border-silver-300 hover:border-gazety-dark');
  }
  scaleBtn(s: HomeScale): string {
    const base = 'flex-1 px-2 py-2 text-xs font-semibold rounded border transition-colors ';
    return base + (this.scale() === s
      ? 'bg-gazety-dark text-white border-gazety-dark'
      : 'bg-white text-silver-600 border-silver-300 hover:border-gazety-dark');
  }

  close() { this.svc.closeAdmin(); }

  save() {
    this.svc.save({
      enabled: this.enabled(),
      mode: this.mode(),
      ids: this.ids(),
      count: this.count() || 0,
      scale: this.scale(),
    }).subscribe({
      next: () => {
        this.svc.saving.set(false);
        this.svc.version.update(v => v + 1); // rafraîchit l'accueil en direct
        this.toast.show(this.fr ? 'Section accueil mise à jour.' : 'Home section updated.', 'success');
        this.close();
      },
      error: () => {
        this.svc.saving.set(false);
        this.toast.show(this.fr ? 'Échec de l\'enregistrement.' : 'Save failed.', 'error');
      },
    });
  }
}
