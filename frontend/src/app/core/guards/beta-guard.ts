import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BetaService } from '../beta/beta.service';
import { map, switchMap, catchError, of, take } from 'rxjs'; // Import take

export const betaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const betaService = inject(BetaService);
  const router = inject(Router);

  // If not authenticated, redirect to login (or root, which might show login)
  // However, `currentUser` is a Signal. We might need to handle the initial loading state or wait for auth.
  // For simplicity, assuming if we are here, we might be logged in or not.

  // Best way with Firebase Auth state is to observe the user observable from auth
  // But AuthService exposes a Signal. We can check the signal value.

  const user = authService.currentUser();

  if (!user) {
      // Not logged in, redirect to home or login
      return router.createUrlTree(['/']);
  }

  // If logged in, check beta status from backend
  return betaService.getStatus().pipe(
    take(1), // Ensure stream completes
    map(status => {
      if (status.hasAccess) {
        return true;
      } else {
        // Redirect to Beta Gate
        return router.createUrlTree(['/beta-gate']);
      }
    }),
    catchError(() => {
        // If error (e.g. backend down), deny or redirect to error page?
        // Safest is to redirect to Beta Gate or Home
        return of(router.createUrlTree(['/beta-gate']));
    })
  );
};
