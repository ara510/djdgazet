import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);

  @Input() mode: 'login' | 'signup' = 'login';
  @Output() close = new EventEmitter<void>();
  @Output() switchMode = new EventEmitter<'login' | 'signup'>();

  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly fullname = signal('');
  readonly remember = signal(true);
  readonly showPassword = signal(false);

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  switchTo(mode: 'login' | 'signup') {
    this.switchMode.emit(mode);
  }

  onSubmit() {
    if (this.mode === 'login') {
      this.auth.login(this.email());
    } else {
      this.auth.signup(this.fullname() || 'User', this.email());
    }
    this.close.emit();
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.close.emit();
    }
  }
}
