import { Component, signal, inject, output, Input, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { PrivacyService } from '../../services/privacy.service';
import lottie, { AnimationItem } from 'lottie-web';
import { frToIso } from '../../utils/date-fr';

type Tab = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lottieContainer') lottieRef!: ElementRef<HTMLDivElement>;
  @ViewChild('authLoadingLottie') authLoadingRef!: ElementRef<HTMLDivElement>;

  auth    = inject(AuthService);
  toast   = inject(ToastService);
  lang    = inject(TranslationService);
  privacy = inject(PrivacyService);

  closed = output<void>();

  /** Onglet initial (le bouton « S'inscrire » du header ouvre 'signup'). */
  @Input() set initialTab(t: Tab) { this.tab.set(t); }

  tab               = signal<Tab>('login');
  loading           = signal(false);
  closing           = signal(false);
  forgotPasswordView = signal(false);
  forgotDone        = signal(false);
  otpView           = signal(false);

  showLoginPwd   = signal(false);
  showPwd        = signal(false);
  showConfirmPwd = signal(false);

  private anim!: AnimationItem;
  private loadAnim?: AnimationItem;

  login       = { username: '', password: '' };
  forgotEmail = '';
  otpCode     = '';

  signup = {
    nom: '', prenoms: '', date_naissance: '', email: '',
    username: '', password: '', passwordConfirm: '', acceptTerms: false,
  };

  ngAfterViewInit() {
    this.anim = lottie.loadAnimation({
      container: this.lottieRef.nativeElement,
      renderer:  'svg',
      loop:      true,
      autoplay:  true,
      path:      'assets/login.json',
    });
    this.loadAnim = lottie.loadAnimation({
      container: this.authLoadingRef.nativeElement,
      renderer:  'svg',
      loop:      true,
      autoplay:  false,
      path:      'assets/loading.json',
    });
  }

  ngOnDestroy() { this.anim?.destroy(); this.loadAnim?.destroy(); }

  get pwdStrength(): 0 | 1 | 2 | 3 {
    const p = this.signup.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)          score++;
    if (/[a-z]/.test(p))        score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 2) return 1;
    if (score <= 3) return 2;
    return 3;
  }

  get strengthLabel(): string {
    const fr = ['', 'Faible', 'Moyen', 'Fort'];
    const en = ['', 'Weak',   'Medium', 'Strong'];
    return (this.lang.lang() === 'fr' ? fr : en)[this.pwdStrength];
  }

  get pwdValid(): boolean { return this.pwdStrength === 3; }

  switchTab(t: Tab) {
    this.tab.set(t);
    this.forgotPasswordView.set(false);
    this.forgotDone.set(false);
    this.otpView.set(false);
  }

  close() {
    this.closing.set(true);
    setTimeout(() => { this.closing.set(false); this.closed.emit(); }, 300);
  }

  private finishLoading(fn: () => void, start: number) {
    const wait = Math.max(0, 1500 - (Date.now() - start));
    setTimeout(() => { this.loadAnim?.stop(); this.loading.set(false); fn(); }, wait);
  }

  onLogin() {
    if (this.loading()) return;
    this.loading.set(true);
    this.loadAnim?.play();
    const start = Date.now();
    this.auth.login(this.login.username, this.login.password).subscribe({
      next: () => this.finishLoading(() => {
        this.toast.show(this.lang.lang() === 'fr' ? 'Connexion réussie !' : 'Signed in successfully!', 'success');
        this.close();
        // Recharge le site pour que tout le contenu se refetch avec le token (veilles déverrouillées).
        setTimeout(() => window.location.reload(), 700);
      }, start),
      error: (err) => this.finishLoading(() => {
        this.toast.show(err.error?.error || 'Erreur de connexion.', 'error');
      }, start),
    });
  }

  onSignup() {
    if (this.loading()) return;
    if (this.signup.password !== this.signup.passwordConfirm) {
      this.toast.show(this.lang.lang() === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.', 'error');
      return;
    }
    if (!this.signup.acceptTerms) {
      this.toast.show(this.lang.lang() === 'fr' ? 'Veuillez accepter les conditions.' : 'Please accept the terms.', 'error');
      return;
    }
    const dobIso = frToIso(this.signup.date_naissance);
    if (!dobIso) {
      this.toast.show(this.lang.lang() === 'fr' ? 'Date de naissance invalide (jj/mm/aaaa).' : 'Invalid date of birth (dd/mm/yyyy).', 'error');
      return;
    }
    this.loading.set(true);
    this.loadAnim?.play();
    const start = Date.now();
    const { passwordConfirm, acceptTerms, ...rest } = this.signup;
    const payload = { ...rest, date_naissance: dobIso };
    this.auth.register(payload).subscribe({
      next: () => this.finishLoading(() => {
        this.auth.sendEmailOtp().subscribe();
        this.otpView.set(true);
      }, start),
      error: (err) => this.finishLoading(() => {
        this.toast.show(err.error?.error || 'Erreur lors de l\'inscription.', 'error');
      }, start),
    });
  }

  onForgotPassword() {
    if (this.loading() || !this.forgotEmail) return;
    this.loading.set(true);
    this.loadAnim?.play();
    const start = Date.now();
    this.auth.forgotPassword(this.forgotEmail).subscribe({
      next: () => this.finishLoading(() => this.forgotDone.set(true), start),
      error: (err) => this.finishLoading(() => {
        this.toast.show(err.error?.error || 'Erreur.', 'error');
      }, start),
    });
  }

  verifyOtp() {
    if (this.loading() || this.otpCode.length !== 6) return;
    this.loading.set(true);
    this.loadAnim?.play();
    const start = Date.now();
    this.auth.verifyEmailOtp(this.otpCode).subscribe({
      next: () => this.finishLoading(() => {
        this.toast.show(this.lang.lang() === 'fr' ? 'Email vérifié ! Bienvenue !' : 'Email verified! Welcome!', 'success');
        this.close();
        setTimeout(() => window.location.reload(), 700);
      }, start),
      error: (err) => this.finishLoading(() => {
        this.toast.show(err.error?.error || 'Code invalide.', 'error');
      }, start),
    });
  }
}
