import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);

  /** Reactive signal of the current Firebase user */
  readonly currentUser = toSignal(user(this.auth), { initialValue: null });

  /** Loading state */
  readonly isLoading = signal(false);

  async loginWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const token = await result.user.getIdToken();

      // Register or fetch user from our BFF
      await this.http.post(`${environment.apiUrl}/auth/register`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).toPromise();
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
