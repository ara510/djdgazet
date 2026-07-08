import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AdminService, FeedbackItem, AdminUser } from '../../services/admin.service';
import { ChatService, ChatConversation, ChatMessage } from '../../services/chat.service';

type AdminTab = 'users' | 'feedback' | 'messages' | 'activity';
interface Option { value: string; fr: string; en: string; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnDestroy {
  private lang   = inject(TranslationService);
  auth   = inject(AuthService);
  toast  = inject(ToastService);
  admin  = inject(AdminService);
  chat   = inject(ChatService);
  private router = inject(Router);

  get fr(): boolean { return this.lang.lang() === 'fr'; }
  t(key: string): string { return this.lang.t(key); }

  // Onglet actif de l'espace Administration.
  tab = signal<AdminTab>('users');

  // ── Messagerie (chat support) ──────────────────────────────────────────────
  conversations = signal<ChatConversation[]>([]);
  convLoading   = signal(false);
  selectedConv  = signal<ChatConversation | null>(null);
  chatMessages  = signal<ChatMessage[]>([]);
  replyDraft    = '';
  sendingReply  = signal(false);
  chatUnread    = computed(() => this.conversations().reduce((s, c) => s + (c.unread || 0), 0));

  private convPoll?:   ReturnType<typeof setInterval>;
  private threadPoll?: ReturnType<typeof setInterval>;

  constructor() {
    // Accès réservé aux administrateurs — sinon retour à l'accueil.
    effect(() => {
      if (!this.auth.token()) { this.router.navigate(['/']); return; }
      const u = this.auth.currentUser();
      if (u && !u.is_admin) this.router.navigate(['/']);
    });

    // Onglet par défaut : Utilisateurs.
    this.admin.loadUsers();
    // Badge de messagerie tenu à jour tant que la page est ouverte.
    this.loadConversations(true);
    this.convPoll = setInterval(() => this.loadConversations(true), 10_000);
  }

  ngOnDestroy() {
    clearInterval(this.convPoll);
    clearInterval(this.threadPoll);
  }

  setTab(tab: AdminTab) {
    this.tab.set(tab);
    if (tab !== 'messages') { this.selectedConv.set(null); this.stopThreadPoll(); }
    if (tab === 'users')    this.admin.loadUsers();
    if (tab === 'feedback') this.admin.loadFeedback();
    if (tab === 'messages') this.loadConversations();
    if (tab === 'activity') this.admin.loadActivity();
  }

  // ── Utilisateurs ───────────────────────────────────────────────────────────
  readonly planValues = ['generale', 'sectorielle', 'dediee'];

  userInitials(u: AdminUser): string {
    return ((u.nom?.[0] ?? '') + (u.prenoms?.[0] ?? '')).toUpperCase();
  }

  planLabel(plan: string): string { return this.lang.t('sub.' + plan + '.name'); }
  selectValue(e: Event): string { return (e.target as HTMLSelectElement).value; }
  checkboxValue(e: Event): boolean { return (e.target as HTMLInputElement).checked; }
  genreLabel(g: string | null): string {
    if (!g) return '—';
    const map: Record<string, { fr: string; en: string }> = {
      homme:  { fr: 'Homme',  en: 'Male'   },
      femme:  { fr: 'Femme',  en: 'Female' },
      autre:  { fr: 'Autre',  en: 'Other'  },
    };
    const m = map[g.toLowerCase()];
    return m ? (this.fr ? m.fr : m.en) : g;
  }

  /** Défilement infini : charge la page suivante quand on approche du bas. */
  onUsersScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 260) this.admin.loadMoreUsers();
  }

  onActivityScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 260) this.admin.loadMoreActivity();
  }

  changeUserPlan(user: AdminUser, plan: string) {
    const prev = user.plan;
    if (plan === prev) return;
    this.admin.users.update(list => list.map(u => u.id === user.id ? { ...u, plan: plan as AdminUser['plan'] } : u));
    this.admin.updateUserPlan(user.id, plan).subscribe({
      next: () => this.toast.show(this.fr ? `Abonnement de @${user.username} mis à jour.` : `@${user.username}'s plan updated.`, 'success'),
      error: (err) => {
        this.admin.users.update(list => list.map(u => u.id === user.id ? { ...u, plan: prev } : u));
        this.toast.show(err.error?.error || 'Erreur.', 'error');
      },
    });
  }

  async toggleDisabled(user: AdminUser) {
    const next = !user.disabled;
    const ok = await this.toast.confirm({
      title: next
        ? (this.fr ? `Désactiver @${user.username} ?` : `Disable @${user.username}?`)
        : (this.fr ? `Réactiver @${user.username} ?` : `Re-enable @${user.username}?`),
      text: next
        ? (this.fr ? 'Le compte ne pourra plus se connecter.' : 'The account will no longer be able to sign in.')
        : (this.fr ? 'Le compte pourra de nouveau se connecter.' : 'The account will be able to sign in again.'),
      danger: next,
      confirmText: next ? (this.fr ? 'Désactiver' : 'Disable') : (this.fr ? 'Réactiver' : 'Re-enable'),
    });
    if (!ok) return;
    this.admin.setUserDisabled(user.id, next).subscribe({
      next: () => {
        this.admin.users.update(list => list.map(u => u.id === user.id ? { ...u, disabled: next } : u));
        this.toast.show(
          next ? (this.fr ? `@${user.username} a été désactivé.` : `@${user.username} disabled.`)
               : (this.fr ? `@${user.username} a été réactivé.` : `@${user.username} re-enabled.`),
          'success'
        );
      },
      error: (err) => this.toast.show(err.error?.error || 'Erreur.', 'error'),
    });
  }

  /** Case à cocher « Administrateur » : promeut ou rétrograde le compte. */
  async toggleAdmin(user: AdminUser, next: boolean) {
    if (next === user.is_admin) return;
    if (user.id === this.auth.currentUser()?.id) {
      this.admin.users.update(l => [...l]); // annule le changement visuel de la case
      this.toast.show(this.fr ? 'Vous ne pouvez pas modifier votre propre statut.' : 'You cannot change your own status.', 'error');
      return;
    }
    const ok = await this.toast.confirm({
      title: next
        ? (this.fr ? `Promouvoir @${user.username} administrateur ?` : `Make @${user.username} an admin?`)
        : (this.fr ? `Retirer les droits admin de @${user.username} ?` : `Revoke @${user.username}'s admin rights?`),
      text: next
        ? (this.fr ? 'Ce compte aura accès à toute l\'administration.' : 'This account will get full admin access.')
        : (this.fr ? 'Ce compte redeviendra un abonné classique.' : 'This account will revert to a regular subscriber.'),
      danger: !next,
      confirmText: next ? (this.fr ? 'Promouvoir' : 'Promote') : (this.fr ? 'Rétrograder' : 'Demote'),
    });
    if (!ok) { this.admin.users.update(l => [...l]); return; } // resync la case sur l'ancienne valeur
    this.admin.users.update(l => l.map(u => u.id === user.id ? { ...u, is_admin: next } : u));
    this.admin.setUserAdmin(user.id, next).subscribe({
      next: () => this.toast.show(
        next ? (this.fr ? `@${user.username} est désormais administrateur.` : `@${user.username} is now an admin.`)
             : (this.fr ? `@${user.username} n\'est plus administrateur.` : `@${user.username} is no longer an admin.`),
        'success'
      ),
      error: (err) => {
        this.admin.users.update(l => l.map(u => u.id === user.id ? { ...u, is_admin: !next } : u));
        this.toast.show(err.error?.error || 'Erreur.', 'error');
      },
    });
  }

  /** Suppression définitive d'un compte (avec confirmation). */
  async deleteUser(user: AdminUser) {
    if (user.id === this.auth.currentUser()?.id) {
      this.toast.show(this.fr ? 'Vous ne pouvez pas supprimer votre propre compte.' : 'You cannot delete your own account.', 'error');
      return;
    }
    const ok = await this.toast.confirm({
      title: this.fr ? `Supprimer définitivement @${user.username} ?` : `Permanently delete @${user.username}?`,
      text: this.fr
        ? 'Le compte et ses données seront effacés de la base. Cette action est irréversible.'
        : 'The account and its data will be erased from the database. This cannot be undone.',
      danger: true,
      confirmText: this.fr ? 'Supprimer' : 'Delete',
    });
    if (!ok) return;
    this.admin.deleteUser(user.id).subscribe({
      next: () => {
        this.admin.removeUserLocal(user.id);
        this.toast.show(this.fr ? `@${user.username} supprimé.` : `@${user.username} deleted.`, 'success');
      },
      error: (err) => this.toast.show(err.error?.error || 'Erreur.', 'error'),
    });
  }

  /** Envoie un message au compte via le chat support. */
  async messageUser(user: AdminUser) {
    const body = await this.toast.prompt({
      title: this.fr ? `Message à @${user.username}` : `Message @${user.username}`,
      text: this.fr ? 'Il apparaîtra dans son chat support.' : 'It will appear in their support chat.',
      placeholder: this.fr ? 'Votre message…' : 'Your message…',
      confirmText: this.fr ? 'Envoyer' : 'Send',
    });
    if (!body || !body.trim()) return;
    this.admin.messageUser(user.id, body.trim()).subscribe({
      next: () => this.toast.show(this.fr ? 'Message envoyé.' : 'Message sent.', 'success'),
      error: (err) => this.toast.show(err.error?.error || 'Erreur.', 'error'),
    });
  }

  // ── Retours d'expérience ─────────────────────────────────────────────────────
  readonly feedbackCategories: Option[] = [
    { value: 'general',    fr: 'Général',      en: 'General'    },
    { value: 'bug',        fr: 'Bug / Erreur', en: 'Bug report' },
    { value: 'suggestion', fr: 'Suggestion',   en: 'Suggestion' },
  ];
  get fbStars(): number[] { return [1, 2, 3, 4, 5]; }
  get fbAvg(): number {
    const rated = this.admin.feedback().filter(f => f.rating);
    if (!rated.length) return 0;
    return Math.round((rated.reduce((s, f) => s + (f.rating || 0), 0) / rated.length) * 10) / 10;
  }
  get fbRatedCount(): number { return this.admin.feedback().filter(f => f.rating).length; }
  fbCategoryLabel(value: string | null): string {
    const o = this.feedbackCategories.find(c => c.value === value);
    return o ? (this.fr ? o.fr : o.en) : (this.fr ? 'Général' : 'General');
  }
  fbAuthor(f: FeedbackItem): string {
    if (f.username) return '@' + f.username;
    return this.fr ? 'Compte supprimé' : 'Deleted account';
  }

  // ── Journal d'activité ───────────────────────────────────────────────────────
  readonly activityMeta: Record<string, { fr: string; en: string; cat: string }> = {
    'veille.create': { fr: 'a créé une veille',        en: 'created a watch item',   cat: 'create' },
    'veille.update': { fr: 'a modifié une veille',     en: 'updated a watch item',   cat: 'update' },
    'veille.delete': { fr: 'a supprimé une veille',    en: 'deleted a watch item',   cat: 'delete' },
    'veille.pin':    { fr: 'a épinglé une veille',     en: 'pinned a watch item',    cat: 'update' },
    'veille.unpin':  { fr: 'a désépinglé une veille',  en: 'unpinned a watch item',  cat: 'update' },
    'veille.restore':{ fr: 'a restauré une veille',    en: 'restored a watch item',  cat: 'create' },
    'veille.purge':  { fr: 'a supprimé définitivement une veille', en: 'permanently deleted a watch item', cat: 'delete' },
    'alert.create':  { fr: 'a publié une alerte',      en: 'published an alert',     cat: 'create' },
    'alert.update':  { fr: 'a modifié une alerte',     en: 'updated an alert',       cat: 'update' },
    'alert.delete':  { fr: 'a supprimé une alerte',    en: 'deleted an alert',       cat: 'delete' },
    'user.plan':     { fr: 'a changé un abonnement',   en: 'changed a plan',         cat: 'user'   },
    'user.disable':  { fr: 'a désactivé un compte',    en: 'disabled an account',    cat: 'delete' },
    'user.enable':   { fr: 'a réactivé un compte',     en: 're-enabled an account',  cat: 'user'   },
    'user.promote':  { fr: 'a promu un administrateur', en: 'promoted an admin',     cat: 'user'   },
    'user.demote':   { fr: 'a rétrogradé un administrateur', en: 'demoted an admin',  cat: 'delete' },
  };
  actionLabel(a: string): string {
    const m = this.activityMeta[a];
    return m ? (this.fr ? m.fr : m.en) : a;
  }
  actionCat(a: string): string { return this.activityMeta[a]?.cat ?? 'update'; }

  // ── Messagerie (logique chat) ────────────────────────────────────────────────
  loadConversations(quiet = false) {
    if (!quiet) this.convLoading.set(true);
    this.chat.loadConversations().subscribe({
      next: rows => { this.convLoading.set(false); this.conversations.set(rows); },
      error: () => { this.convLoading.set(false); },
    });
  }

  openConversation(c: ChatConversation) {
    this.selectedConv.set(c);
    this.replyDraft = '';
    this.chatMessages.set([]);
    this.loadThread(c.id);
    this.startThreadPoll(c.id);
  }

  closeConversation() {
    this.selectedConv.set(null);
    this.stopThreadPoll();
    this.loadConversations(true);
  }

  private loadThread(id: number, quiet = false) {
    this.chat.loadConversation(id).subscribe({
      next: res => {
        const grew = res.messages.length > this.chatMessages().length;
        this.chatMessages.set(res.messages);
        const cur = this.selectedConv();
        if (cur && cur.id === id) this.selectedConv.set({ ...cur, ...res.conversation });
        this.markConvRead(id);
        if (grew || !quiet) this.scrollChat();
      },
      error: () => {},
    });
  }

  sendReply() {
    const id = this.selectedConv()?.id;
    const body = this.replyDraft.trim();
    if (!id || !body || this.sendingReply()) return;
    this.sendingReply.set(true);
    this.chat.reply(id, body).subscribe({
      next: res => {
        this.chatMessages.update(m => [...m, res.message]);
        this.replyDraft = '';
        this.sendingReply.set(false);
        this.scrollChat();
      },
      error: () => {
        this.sendingReply.set(false);
        this.toast.show(this.fr ? 'Échec de l\'envoi.' : 'Send failed.', 'error');
      },
    });
  }

  private markConvRead(id: number) {
    this.conversations.update(list => list.map(c => c.id === id ? { ...c, unread: 0 } : c));
  }
  private startThreadPoll(id: number) {
    this.stopThreadPoll();
    this.threadPoll = setInterval(() => this.loadThread(id, true), 4000);
  }
  private stopThreadPoll() { if (this.threadPoll) { clearInterval(this.threadPoll); this.threadPoll = undefined; } }
  private scrollChat() {
    setTimeout(() => { const el = document.querySelector('.chatadm__messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
  }

  convName(c: ChatConversation): string {
    if (c.user_id) return `${c.prenoms || ''} ${c.nom || ''}`.trim() || ('@' + (c.username || ''));
    return c.guest_name || c.guest_email || (this.fr ? 'Visiteur' : 'Visitor');
  }
  convSub(c: ChatConversation): string {
    if (c.user_id) return '@' + (c.username || '') + (c.plan ? ' · ' + this.lang.t('sub.' + c.plan + '.short') : '');
    return c.guest_email || (this.fr ? 'Visiteur anonyme' : 'Anonymous visitor');
  }
  convInitials(c: ChatConversation): string {
    return (this.convName(c).trim()[0] || '?').toUpperCase();
  }
}
