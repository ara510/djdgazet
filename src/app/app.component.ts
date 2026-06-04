import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { BreakingTickerComponent } from './components/breaking-ticker/breaking-ticker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoginModalComponent,
    BreakingTickerComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header (openAuth)="openAuth($event)" />
      <app-breaking-ticker />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      @if (authModal()) {
        <app-login-modal
          [mode]="authMode()"
          (close)="closeAuth()"
          (switchMode)="switchAuthMode($event)"
        />
      }
    </div>
  `,
})
export class AppComponent {
  readonly authModal = signal(false);
  readonly authMode = signal<'login' | 'signup'>('login');

  openAuth(mode: 'login' | 'signup') {
    this.authMode.set(mode);
    this.authModal.set(true);
  }

  closeAuth() {
    this.authModal.set(false);
  }

  switchAuthMode(mode: 'login' | 'signup') {
    this.authMode.set(mode);
  }
}
