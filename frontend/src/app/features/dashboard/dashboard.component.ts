import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons],
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>
          Phylactery<span class="text-red-500">.</span> Bridge
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="clear" color="danger">
            Logout
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="min-h-full bg-black text-white p-8">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold mb-2">
            Welcome, {{ authService.currentUser()?.displayName ?? 'Architect' }}
          </h2>
          <p class="text-gray-400 mb-8">Your deliberation workspace awaits.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- New Deliberation Card -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-red-500 transition-colors cursor-pointer">
              <h3 class="text-xl font-semibold text-white mb-2">
                🧠 New Deliberation
              </h3>
              <p class="text-gray-400 text-sm">
                Start an AI-powered architecture review session.
              </p>
            </div>

            <!-- Projects Card -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-red-500 transition-colors cursor-pointer">
              <h3 class="text-xl font-semibold text-white mb-2">
                🏗️ My Projects
              </h3>
              <p class="text-gray-400 text-sm">
                View and manage your project contexts.
              </p>
            </div>
          </div>
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
export class DashboardComponent {
  readonly authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
