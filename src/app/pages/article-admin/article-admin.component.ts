import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ArticleService, ArticleItem } from '../../services/article.service';
import { isoToFr, frToIso } from '../../utils/date-fr';
import { RichEditorComponent } from '../../components/rich-editor/rich-editor.component';

const SECTORS = ['politique', 'economie', 'international', 'social', 'environnement', 'agriculture', 'tourisme', 'mines', 'telecoms', 'autre'];

@Component({
  selector: 'app-article-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RichEditorComponent],
  templateUrl: './article-admin.component.html',
})
export class ArticleAdminComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly articlesSvc = inject(ArticleService);
  private readonly http = inject(HttpClient);

  readonly sectors = SECTORS;
  readonly fr = computed(() => this.i18n.isFrench());
  readonly isAdmin = computed(() => {
    const u = this.auth.currentUser();
    return !!(u?.is_admin && u?.email_verified);
  });

  readonly articles = signal<ArticleItem[]>([]);
  readonly loading = signal(true);

  // ── Formulaire ────────────────────────────────────────────────────────
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly fSector = signal('politique');
  readonly fTitle = signal('');
  readonly fDescription = signal('');
  readonly fAuthor = signal('');
  readonly fAuthorRole = signal('');
  readonly fDate = signal('');
  readonly fCreationDate = signal('');
  readonly fReadMinutes = signal<number | null>(null);
  readonly fImages = signal<string[]>([]);
  readonly fImageUrl = signal('');
  readonly fImageAlt = signal('');
  readonly fImagePosition = signal('50% 50%'); // cadrage (object-position) de la photo principale

  constructor() {
    this.reload();
  }

  sectorLabel(s: string): string { return this.i18n.t('sector.' + s); }

  formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(this.fr() ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  reload() {
    this.loading.set(true);
    this.articlesSvc.list().subscribe({
      next: rows => { this.articles.set(rows); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  newArticle() {
    this.editingId.set(null);
    this.fSector.set('politique'); this.fTitle.set(''); this.fDescription.set('');
    this.fAuthor.set(''); this.fAuthorRole.set(''); this.fDate.set(isoToFr(new Date().toISOString().slice(0, 10)));
    this.fCreationDate.set(''); this.fReadMinutes.set(null); this.fImages.set([]); this.fImageUrl.set(''); this.fImageAlt.set('');
    this.fImagePosition.set('50% 50%');
    this.formOpen.set(true);
  }

  edit(a: ArticleItem) {
    this.editingId.set(a.id);
    this.fSector.set(a.sector); this.fTitle.set(a.title); this.fDescription.set(a.description ?? '');
    this.fAuthor.set(a.author); this.fAuthorRole.set(a.author_role ?? ''); this.fDate.set(isoToFr(a.published_at));
    this.fCreationDate.set(isoToFr(a.creation_date));
    this.fReadMinutes.set(a.read_minutes ?? null);
    this.fImages.set(a.images?.length ? [...a.images] : (a.image ? [a.image] : []));
    this.fImageUrl.set(''); this.fImageAlt.set(a.image_alt ?? '');
    this.fImagePosition.set(a.image_position || '50% 50%');
    this.formOpen.set(true);
  }

  cancel() { this.formOpen.set(false); }

  /** Cadrage de la photo principale : point focal défini au clic/déplacement sur l'aperçu. */
  private clampPct(n: number): number { return Math.max(0, Math.min(100, Math.round(n))); }
  setFocal(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = this.clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = this.clampPct(((e.clientY - rect.top) / rect.height) * 100);
    this.fImagePosition.set(`${x}% ${y}%`);
  }
  onFocalDrag(e: MouseEvent) { if (e.buttons === 1) this.setFocal(e); }
  focalX(): number { return parseInt(this.fImagePosition().split(' ')[0], 10) || 50; }
  focalY(): number { return parseInt(this.fImagePosition().split(' ')[1], 10) || 50; }
  setFocalPreset(pos: string) { this.fImagePosition.set(pos); }

  /** Upload local — plusieurs photos possibles en une fois. */
  onImageSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    this.uploading.set(true);
    this.http.post<{ urls: string[] }>('/api/upload', fd, { headers: { Authorization: `Bearer ${this.auth.token()}` } }).subscribe({
      next: r => { this.fImages.update(list => [...list, ...(r.urls ?? [])]); this.uploading.set(false); input.value = ''; },
      error: () => { this.uploading.set(false); this.toast.show(this.fr() ? "Échec de l'envoi de l'image." : 'Image upload failed.', 'error'); },
    });
  }

  /** Ajoute une photo via un lien externe. */
  addImageUrl() {
    const url = this.fImageUrl().trim();
    if (!url) return;
    this.fImages.update(list => [...list, url]);
    this.fImageUrl.set('');
  }

  removeImage(i: number) {
    this.fImages.update(list => list.filter((_, idx) => idx !== i));
  }

  save() {
    if (this.saving()) return;
    const pub = frToIso(this.fDate());
    if (!this.fTitle().trim() || !this.fAuthor().trim() || !pub) {
      this.toast.show(this.fr() ? 'Titre, auteur et date d’ajout (jj/mm/aaaa) sont requis.' : 'Title, author and date (dd/mm/yyyy) are required.', 'error');
      return;
    }
    const creation = this.fCreationDate().trim() ? frToIso(this.fCreationDate()) : '';
    if (this.fCreationDate().trim() && !creation) {
      this.toast.show(this.fr() ? 'Date de création invalide (jj/mm/aaaa).' : 'Invalid creation date (dd/mm/yyyy).', 'error');
      return;
    }
    const payload: Partial<ArticleItem> = {
      sector: this.fSector(),
      title: this.fTitle().trim(),
      description: this.fDescription().trim() || null,
      author: this.fAuthor().trim(),
      author_role: this.fAuthorRole().trim() || null,
      published_at: pub,
      creation_date: creation || null,
      read_minutes: this.fReadMinutes() || null,
      image: this.fImages()[0] || null,
      images: this.fImages(),
      image_alt: this.fImageAlt().trim() || null,
      image_position: this.fImages().length ? this.fImagePosition() : null,
    };
    this.saving.set(true);
    const id = this.editingId();
    const req$ = id != null ? this.articlesSvc.update(id, payload) : this.articlesSvc.create(payload);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.show(this.fr() ? 'Article enregistré.' : 'Article saved.', 'success');
        this.reload();
      },
      error: (e) => { this.saving.set(false); this.toast.show(e.error?.error || (this.fr() ? 'Enregistrement impossible.' : 'Save failed.'), 'error'); },
    });
  }

  async remove(a: ArticleItem) {
    const ok = await this.toast.confirm({
      title: this.fr() ? 'Supprimer cet article ?' : 'Delete this article?',
      text: a.title,
      danger: true,
      confirmText: this.fr() ? 'Supprimer' : 'Delete',
    });
    if (!ok) return;
    this.articlesSvc.remove(a.id).subscribe({
      next: () => { this.toast.show(this.fr() ? 'Article supprimé.' : 'Article deleted.', 'success'); this.reload(); },
      error: () => this.toast.show(this.fr() ? 'Suppression impossible.' : 'Delete failed.', 'error'),
    });
  }
}
