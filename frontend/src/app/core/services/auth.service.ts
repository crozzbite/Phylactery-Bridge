import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';

export function isFullyAuthenticatedState(
  hasFirebaseUser: boolean,
  internalUserResolved: boolean | null,
): boolean {
  return hasFirebaseUser && internalUserResolved === true;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);

  /** Reactive signal of the current Firebase user */
  readonly currentUser = toSignal(user(this.auth), { initialValue: null });

  /** Loading state */
  readonly isLoading = signal(false);
  readonly internalUserResolved = signal<boolean | null>(null);

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
      this.internalUserResolved.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.internalUserResolved.set(null);
  }

  clearLocalAuthExpectation(): void {
    this.internalUserResolved.set(null);
  }

  setInternalUserResolved(resolved: boolean): void {
    this.internalUserResolved.set(resolved);
  }

  get isAuthenticated(): boolean {
    return isFullyAuthenticatedState(this.currentUser() !== null, this.internalUserResolved());
  }
}
