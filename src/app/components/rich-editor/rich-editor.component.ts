import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Éditeur de texte enrichi (contenteditable + execCommand), façon traitement de texte :
 * styles de bloc (titres, citation), gras/italique/souligné/barré, indice/exposant,
 * taille, couleur, surlignage, alignements, listes, retraits, lien. Produit du HTML.
 * Le rendu final s'appuie sur la classe CSS globale `.article-richtext` (styles « prose »).
 */
@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-silver-300 rounded-sm overflow-hidden">
      <div class="flex items-center gap-0.5 flex-wrap bg-silver-50 border-b border-silver-200 px-1.5 py-1.5">
        <!-- Style de bloc -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="block('P')" class="re-btn" title="Paragraphe normal"><span class="text-xs font-semibold">¶</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="block('H2')" class="re-btn" title="Titre"><span class="text-[13px] font-black">T</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="block('H3')" class="re-btn" title="Sous-titre"><span class="text-[11px] font-bold">t</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="block('BLOCKQUOTE')" class="re-btn" title="Citation (recliquer pour annuler)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v6H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 0V5m6 2h4v6h-4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 0V5"/></svg>
        </button>
        <label class="re-btn relative cursor-pointer" title="Couleur du trait de la citation" (mousedown)="saveSel()">
          <span class="inline-block w-[3px] h-3.5 rounded-sm" [style.background]="quoteColor"></span>
          <span class="ml-px text-[11px] leading-none">❝</span>
          <input type="color" [value]="quoteColor" (input)="setQuoteColor($event)" class="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <span class="re-sep"></span>

        <!-- Taille -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize','2')" class="re-btn" title="Petit"><span class="text-[10px] font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize','3')" class="re-btn" title="Normal"><span class="text-[13px] font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize','5')" class="re-btn" title="Grand"><span class="text-base font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize','6')" class="re-btn" title="Très grand"><span class="text-lg font-semibold">A</span></button>
        <span class="re-sep"></span>

        <!-- Styles de caractère -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('bold')" class="re-btn font-bold" title="Gras (Ctrl+B)">B</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('italic')" class="re-btn italic" title="Italique (Ctrl+I)">I</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('underline')" class="re-btn underline" title="Souligné (Ctrl+U)">U</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('strikeThrough')" class="re-btn line-through" title="Barré">S</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('subscript')" class="re-btn" title="Indice">x<sub class="text-[9px]">2</sub></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('superscript')" class="re-btn" title="Exposant">x<sup class="text-[9px]">2</sup></button>
        <span class="re-sep"></span>

        <!-- Couleurs -->
        <label class="re-btn relative cursor-pointer" title="Couleur du texte" (mousedown)="saveSel()">
          <span class="font-bold leading-none">A</span><span class="absolute bottom-1 left-1.5 right-1.5 h-[3px] rounded" [style.background]="textColor"></span>
          <input type="color" [value]="textColor" (input)="applyColor($event)" class="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <label class="re-btn relative cursor-pointer" title="Surligner" (mousedown)="saveSel()">
          <span class="leading-none px-0.5 rounded" [style.background]="hiliteColor">A</span>
          <input type="color" [value]="hiliteColor" (input)="applyHilite($event)" class="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <span class="re-sep"></span>

        <!-- Alignement -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="align('justifyLeft')" class="re-btn" title="Aligner à gauche">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="14" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="align('justifyCenter')" class="re-btn" title="Centrer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="align('justifyRight')" class="re-btn" title="Aligner à droite">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="align('justifyFull')" class="re-btn" title="Justifier">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="re-sep"></span>

        <!-- Listes + retraits -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('insertUnorderedList')" class="re-btn" title="Liste à puces">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('insertOrderedList')" class="re-btn" title="Liste numérotée">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><text x="1.5" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="1.5" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="1.5" y="20" font-size="7" fill="currentColor" stroke="none">3</text></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('outdent')" class="re-btn" title="Diminuer le retrait">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="18" x2="3" y2="18"/><line x1="21" y1="12" x2="11" y2="12"/><polyline points="7 8 3 12 7 16"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('indent')" class="re-btn" title="Augmenter le retrait">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="13" y1="12" x2="21" y2="12"/><polyline points="5 8 9 12 5 16"/></svg>
        </button>
        <span class="re-sep"></span>

        <!-- Lien + effacer -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="makeLink()" class="re-btn" title="Insérer un lien">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('unlink')" class="re-btn" title="Retirer le lien">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a5 5 0 0 1 .5 6.4M9 9l-2 2a5 5 0 0 0 7 7l1-1"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
        </button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="clearFormat()" class="re-btn" title="Effacer la mise en forme">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><line x1="15" y1="15" x2="20" y2="20"/><line x1="20" y1="15" x2="15" y2="20"/></svg>
        </button>
      </div>

      <div #ed contenteditable="true" (input)="onInput()" (paste)="onPaste($event)" (mouseup)="saveSel()" (keyup)="saveSel()"
           class="article-richtext px-4 py-3 min-h-[16rem] max-h-[32rem] overflow-y-auto text-sm text-gazety-dark leading-relaxed focus:outline-none"></div>
    </div>
  `,
  styles: [`
    .re-btn { display:inline-flex; align-items:center; justify-content:center; min-width:1.9rem; height:1.9rem; padding:0 .3rem; border-radius:.25rem; font-size:.8rem; color:#1d1d1f; }
    .re-btn:hover { background:#e2e5e9; }
    .re-sep { width:1px; height:1.2rem; background:#cbd0d6; margin:0 .2rem; }
  `],
})
export class RichEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('ed') ed!: ElementRef<HTMLDivElement>;
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  textColor = '#1d1d1f';
  hiliteColor = '#fde68a';
  private savedRange: Range | null = null;

  ngAfterViewInit() {
    this.ed.nativeElement.innerHTML = this.value || '';
  }

  ngOnChanges(c: SimpleChanges) {
    if (c['value'] && this.ed && document.activeElement !== this.ed.nativeElement) {
      this.ed.nativeElement.innerHTML = this.value || '';
    }
  }

  /** Sauvegarde la sélection courante (avant d'ouvrir un sélecteur de couleur qui vole le focus). */
  saveSel() {
    const s = window.getSelection();
    if (s && s.rangeCount && this.ed.nativeElement.contains(s.anchorNode)) {
      this.savedRange = s.getRangeAt(0).cloneRange();
    }
  }
  private restoreSel() {
    if (!this.savedRange) { this.ed.nativeElement.focus(); return; }
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(this.savedRange);
  }

  /** Commande simple (garde le focus grâce au mousedown preventDefault sur le bouton). */
  cmd(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    this.onInput();
  }
  /** Commande avec styles CSS inline (couleurs / surlignage / alignement) → rendu fiable et propre. */
  private styled(command: string, arg?: string) {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, arg);
    document.execCommand('styleWithCSS', false, 'false');
    this.onInput();
  }
  align(command: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') { this.styled(command); }
  /** Style de bloc : titre / sous-titre / citation / paragraphe. Re-cliquer le même style
   *  l'ANNULE (retour au paragraphe normal) — bascule. */
  block(tag: 'P' | 'H2' | 'H3' | 'BLOCKQUOTE') {
    const cur = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    const target = (tag !== 'P' && cur === tag.toLowerCase()) ? 'p' : tag.toLowerCase();
    this.cmd('formatBlock', '<' + target + '>');
  }

  // ── Couleur du trait de la citation (blockquote) ──────────────────────────
  quoteColor = '#B23A2E';
  private currentBlockquote(): HTMLElement | null {
    let node = window.getSelection()?.anchorNode as Node | null;
    while (node && node !== this.ed.nativeElement) {
      if (node.nodeType === 1 && (node as HTMLElement).tagName === 'BLOCKQUOTE') return node as HTMLElement;
      node = node.parentNode;
    }
    return null;
  }
  setQuoteColor(e: Event) {
    this.quoteColor = (e.target as HTMLInputElement).value;
    this.restoreSel();
    const bq = this.currentBlockquote();
    if (bq) { bq.style.borderLeftColor = this.quoteColor; this.onInput(); }
    else this.toastNoQuote();
  }
  /** Petit repère : indique qu'il faut être dans une citation (pas de toast service ici → titre). */
  private toastNoQuote() { /* silencieux : sans citation active, on ne fait rien */ }

  applyColor(e: Event) {
    this.textColor = (e.target as HTMLInputElement).value;
    this.restoreSel();
    this.styled('foreColor', this.textColor);
  }
  applyHilite(e: Event) {
    this.hiliteColor = (e.target as HTMLInputElement).value;
    this.restoreSel();
    this.styled('hiliteColor', this.hiliteColor);
  }

  makeLink() {
    const url = window.prompt('Adresse du lien (https://…)', 'https://');
    if (url && /^https?:\/\//i.test(url)) this.cmd('createLink', url);
  }
  clearFormat() { this.cmd('removeFormat'); this.cmd('formatBlock', '<p>'); }

  /** Collage nettoyé : on garde la structure utile (titres, listes, gras…) sans le bagage Word. */
  onPaste(e: ClipboardEvent) {
    const cd = e.clipboardData;
    if (!cd) return;
    e.preventDefault();
    const html = cd.getData('text/html');
    if (html) document.execCommand('insertHTML', false, this.cleanHtml(html));
    else document.execCommand('insertText', false, cd.getData('text/plain'));
    this.onInput();
  }

  private static readonly ALLOWED = new Set(['B','STRONG','I','EM','U','S','STRIKE','SUB','SUP','P','BR','DIV','SPAN','UL','OL','LI','H1','H2','H3','H4','BLOCKQUOTE','A']);

  private cleanHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    this.sanitizeNode(tmp);
    return tmp.innerHTML;
  }
  private sanitizeNode(node: Node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) { node.removeChild(child); continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      this.sanitizeNode(el);
      if (!RichEditorComponent.ALLOWED.has(el.tagName)) {
        while (el.firstChild) node.insertBefore(el.firstChild, el);
        node.removeChild(el);
      } else {
        for (const attr of Array.from(el.attributes)) {
          const keep = (el.tagName === 'A' && attr.name === 'href')
            || (attr.name === 'style' && /text-align/i.test(attr.value)); // garde l'alignement collé
          if (!keep) el.removeAttribute(attr.name);
        }
      }
    }
  }

  onInput() { this.valueChange.emit(this.ed.nativeElement.innerHTML); }
}
