import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BetaService } from '../../core/beta/beta.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-beta-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beta-gate.component.html',
  styleUrl: './beta-gate.component.scss'
})
export class BetaGateComponent {
  private betaService = inject(BetaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  code = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  async redeem() {
    if (!this.code().trim()) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.betaService.redeemCode(this.code()).subscribe({
      next: (res) => {
        this.success.set(res.message || 'Access Granted. Welcome to the Bridge.');
        setTimeout(() => {
          this.router.navigate(['/workspaces']); 
        }, 1500);
      },
      error: (err) => {
        console.error('Redemption failed', err);
        const msg = err.error?.message || 'Invalid or expired code.';
        this.error.set(msg);
        this.loading.set(false);
      },
      complete: () => {
        // Loading false is handled in error, or after nav in success (component destroys)
        // But if we want to be safe:
        if (!this.success()) this.loading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}
