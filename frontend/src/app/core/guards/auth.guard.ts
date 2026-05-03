import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.currentUser();
  const internalUserResolved = authService.internalUserResolved();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  if (internalUserResolved === false) {
    return router.createUrlTree(['/login'], {
      queryParams: { intent: 'onboarding' },
    });
  }

  if (internalUserResolved !== true) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
