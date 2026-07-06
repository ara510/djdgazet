import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Petit éditeur de texte enrichi (contenteditable + execCommand) :
 * gras, italique, surlignage, taille de police. Produit du HTML.
 */
@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-silver-300 rounded-sm overflow-hidden">
      <div class="flex items-center gap-1 flex-wrap bg-silver-50 border-b border-silver-200 px-2 py-1.5">
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('bold')"
                class="w-8 h-8 rounded hover:bg-silver-200 font-bold text-sm">B</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('italic')"
                class="w-8 h-8 rounded hover:bg-silver-200 italic text-sm">I</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('underline')"
                class="w-8 h-8 rounded hover:bg-silver-200 underline text-sm">U</button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('hiliteColor', '#fde68a')"
                class="h-8 px-2 rounded hover:bg-silver-200 text-sm" title="Surligner">
          <span style="background:#fde68a;padding:0 3px;border-radius:2px;">A</span>
        </button>
        <span class="w-px h-5 bg-silver-300 mx-1"></span>
        <!-- Taille : s'applique à la SÉLECTION (mousedown preventDefault = on garde la sélection) -->
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize', '2')"
                class="w-8 h-8 rounded hover:bg-silver-200 flex items-center justify-center" title="Petit"><span class="text-[10px] font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize', '3')"
                class="w-8 h-8 rounded hover:bg-silver-200 flex items-center justify-center" title="Normal"><span class="text-sm font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize', '5')"
                class="w-8 h-8 rounded hover:bg-silver-200 flex items-center justify-center" title="Grand"><span class="text-lg font-semibold">A</span></button>
        <button type="button" (mousedown)="$event.preventDefault()" (click)="cmd('fontSize', '6')"
                class="w-8 h-8 rounded hover:bg-silver-200 flex items-center justify-center" title="Très grand"><span class="text-xl font-semibold">A</span></button>
      </div>
      <div #ed contenteditable="true" (input)="onInput()" (paste)="onPaste($event)"
           class="px-4 py-3 min-h-[10rem] text-sm text-gazety-dark leading-relaxed focus:outline-none"></div>
    </div>
  `,
})
export class RichEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('ed') ed!: ElementRef<HTMLDivElement>;
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  ngAfterViewInit() {
    this.ed.nativeElement.innerHTML = this.value || '';
  }

  ngOnChanges(c: SimpleChanges) {
    // Met à jour le contenu quand la valeur change de l'extérieur (édition d'un autre article),
    // sans écraser la frappe en cours.
    if (c['value'] && this.ed && document.activeElement !== this.ed.nativeElement) {
      this.ed.nativeElement.innerHTML = this.value || '';
    }
  }

  cmd(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    this.onInput();
  }

  /** Collage nettoyé : on ne garde que la mise en forme utile (supprime le bagage Word). */
  onPaste(e: ClipboardEvent) {
    const cd = e.clipboardData;
    if (!cd) return;
    e.preventDefault();
    const html = cd.getData('text/html');
    if (html) {
      document.execCommand('insertHTML', false, this.cleanHtml(html));
    } else {
      document.execCommand('insertText', false, cd.getData('text/plain'));
    }
    this.onInput();
  }

  private static readonly ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'P', 'BR', 'DIV', 'SPAN', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'A']);

  private cleanHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    this.sanitizeNode(tmp);
    return tmp.innerHTML;
  }

  private sanitizeNode(node: Node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        node.removeChild(child); // commentaires Word <!--[if …]-->
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      this.sanitizeNode(el); // récursif d'abord
      if (!RichEditorComponent.ALLOWED.has(el.tagName)) {
        // balise non autorisée (o:p, font, style Word…) → on la retire en gardant son texte
        while (el.firstChild) node.insertBefore(el.firstChild, el);
        node.removeChild(el);
      } else {
        // on enlève tous les attributs (style/class/mso…), sauf href sur les liens
        for (const attr of Array.from(el.attributes)) {
          if (!(el.tagName === 'A' && attr.name === 'href')) el.removeAttribute(attr.name);
        }
      }
    }
  }

  onInput() {
    this.valueChange.emit(this.ed.nativeElement.innerHTML);
  }
}
