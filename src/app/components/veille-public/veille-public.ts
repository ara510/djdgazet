import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { VeilleItem } from '../../services/veille.service';
import { VeilleIconComponent } from '../veille-icon/veille-icon';

interface Opt { value: string; fr: string; en: string; }

/** Veille de la vitrine publique : VeilleItem + métadonnées d'aperçu (palier + verrou). */
interface PublicVeille extends VeilleItem {
  tier?: 'generale' | 'sectorielle' | 'dediee';
  locked?: boolean;
}

@Component({
  selector: 'app-veille-public',
  standalone: true,
  imports: [CommonModule, VeilleIconComponent],
  templateUrl: './veille-public.html',
  styleUrl: './veille-public.scss',
})
export class VeillePublicComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  lang = inject(TranslationService);
  auth = inject(AuthService);

  /** Demande l'ouverture de la modale de connexion/inscription. */
  openAuth = output<void>();

  readonly STORE = 'hd_public_reads';

  items    = signal<PublicVeille[]>([]);
  loading  = signal(true);
  selected = signal<PublicVeille | null>(null);
  showGate = signal(false);
  gateMode = signal<'reads' | 'paid'>('reads'); // 'reads' = quota gratuit atteint ; 'paid' = veille payante

  tierLabel(tier?: string | null): string {
    if (tier === 'dediee')      return this.fr ? 'Veille Dédiée'      : 'Dedicated watch';
    if (tier === 'sectorielle') return this.fr ? 'Veille Sectorielle' : 'Sectoral watch';
    return this.fr ? 'Veille Générale' : 'General watch';
  }

  get fr(): boolean { return this.lang.lang() === 'fr'; }
  get isLogged(): boolean { return !!this.auth.currentUser(); }

  readonly sourceTypes: Opt[] = [
    { value: 'web', fr: 'Site web', en: 'Website' }, { value: 'social', fr: 'Réseau social', en: 'Social media' },
    { value: 'radio', fr: 'Radio', en: 'Radio' }, { value: 'tv', fr: 'Télévision', en: 'TV' }, { value: 'presse', fr: 'Presse écrite', en: 'Print press' },
    { value: 'institution', fr: 'Institution', en: 'Institution' },
  ];
  readonly sectors: Opt[] = [
    { value: 'politique', fr: 'Politique', en: 'Politics' }, { value: 'economie', fr: 'Économie', en: 'Economy' },
    { value: 'international', fr: 'International', en: 'International' }, { value: 'social', fr: 'Social', en: 'Social' }, { value: 'autre', fr: 'Autre', en: 'Other' },
  ];
  readonly networks: Record<string, string> = { facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', x: 'X', linkedin: 'LinkedIn' };

  typeLabel(v?: string | null) { const o = this.sourceTypes.find(t => t.value === v); return o ? (this.fr ? o.fr : o.en) : ''; }
  sectorLabel(v?: string | null) { const o = this.sectors.find(s => s.value === v); return o ? (this.fr ? o.fr : o.en) : ''; }
  readonly tagLabels: Record<string, { fr: string; en: string }> = {
    actualite:     { fr: 'Actualité',     en: 'News'     },
    fait_marquant: { fr: 'Fait marquant', en: 'Key fact' },
  };
  networkLabel(v?: string | null) { return v ? (this.networks[v] ?? '') : ''; }
  networksOf(i: VeilleItem): string[] { return i.social_networks?.length ? i.social_networks : (i.social_network ? [i.social_network] : []); }
  tagsOf(i: VeilleItem): string[] { return i.tags?.length ? i.tags : []; }
  tagLabel(v?: string | null) { const o = v ? this.tagLabels[v] : null; return o ? (this.fr ? o.fr : o.en) : ''; }
  typesOf(i: VeilleItem): string[] { return i.source_types?.length ? i.source_types : (i.source_type ? [i.source_type] : []); }
  urlsOf(i: VeilleItem): string[] { return i.urls?.length ? i.urls : (i.url ? [i.url] : []); }
  cardHeading(i: VeilleItem): string { return i.title || this.sectorLabel(i.sector) || i.source || this.typeLabel(i.source_type); }
  showSectorChip(i: VeilleItem): boolean { return !!i.title && !!i.sector; }

  ngOnInit() {
    this.http.get<PublicVeille[]>('/api/veille/public').subscribe({
      next: rows => { this.items.set(rows); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  private reads(): number[] {
    try { return JSON.parse(localStorage.getItem(this.STORE) || '[]'); } catch { return []; }
  }
  /** Veilles librement lisibles (Générale, non verrouillées) réellement disponibles. */
  get freeItems(): PublicVeille[] { return this.items().filter(i => !i.locked); }
  /** Limite = nombre de veilles gratuites réellement publiées (plus de valeur figée « 5 »). */
  get freeLimit(): number { return this.freeItems.length; }
  get remaining(): number { return Math.max(0, this.freeLimit - this.reads().length); }

  openItem(item: PublicVeille) {
    // Veilles payantes (Sectorielle / Dédiée) : verrou immédiat → payer ou créer un compte.
    if (item.locked) { this.gateMode.set('paid'); this.showGate.set(true); return; }
    if (this.isLogged) { this.selected.set(item); return; }       // connecté : pas de limite ici
    const r = this.reads();
    if (r.includes(item.id)) { this.selected.set(item); return; } // déjà lue → ne recompte pas
    if (r.length >= this.freeLimit) { this.gateMode.set('reads'); this.showGate.set(true); return; } // toutes lues → créer un compte
    r.push(item.id);
    localStorage.setItem(this.STORE, JSON.stringify(r));
    this.selected.set(item);
  }

  close() { this.selected.set(null); }

  goSignup() { this.showGate.set(false); this.selected.set(null); this.openAuth.emit(); }

  /** Renvoie vers la page des abonnements. */
  goOffers() {
    this.showGate.set(false); this.selected.set(null);
    this.router.navigate(['/abonnements']);
  }
}
