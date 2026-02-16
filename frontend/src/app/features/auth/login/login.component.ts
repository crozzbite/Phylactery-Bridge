import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonButton, IonSpinner],
  template: `
    <ion-content class="ion-padding">
      <div class="min-h-screen flex items-center justify-center bg-black">
        <div class="text-center space-y-8">
          <!-- Logo -->
          <div class="mb-8">
            <h1 class="text-5xl font-bold text-white tracking-tight">
              Phylactery<span class="text-red-500">.</span>
            </h1>
            <p class="text-gray-400 mt-2 text-sm tracking-widest uppercase">
              Bridge
            </p>
          </div>

          <!-- Tagline -->
          <p class="text-gray-300 text-lg max-w-md mx-auto">
            AI-Powered Architecture Deliberation Platform
          </p>

          <!-- Login Button -->
          <div class="mt-12">
            @if (authService.isLoading()) {
              <ion-spinner name="crescent" color="light"></ion-spinner>
            } @else {
              <ion-button
                (click)="loginWithGoogle()"
                expand="block"
                color="danger"
                class="max-w-xs mx-auto"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </span>
              </ion-button>
            }
          </div>

          <!-- Footer -->
          <p class="text-gray-600 text-xs mt-16">
            Powered by <span class="text-red-500 font-semibold">SkullRender</span>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    await this.authService.loginWithGoogle();
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }
}
