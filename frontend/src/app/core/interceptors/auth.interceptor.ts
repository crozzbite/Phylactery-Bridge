import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, of, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = auth.currentUser;
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  const handleAuthErrors = (error: unknown) => {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;
    const body = typeof error === 'object' && error !== null && 'error' in error
      ? (error as { error?: Record<string, unknown> }).error
      : undefined;
    const bodyCode = typeof body?.['code'] === 'string' ? body['code'] : '';
    const bodyMessage = typeof body?.['message'] === 'string' ? body['message'] : '';
    const identityNotResolved =
      bodyCode === 'IDENTITY_NOT_RESOLVED' || bodyMessage === 'IDENTITY_NOT_RESOLVED';

    if (status === 401) {
      authService.clearLocalAuthExpectation();
      void router.navigate(['/login']);
    } else if (status === 403 && identityNotResolved) {
      authService.setInternalUserResolved(false);
      void router.navigate(['/login'], {
        queryParams: { intent: 'onboarding' },
      });
    } else if (status === 403) {
      void router.navigate(['/beta-gate']);
    }

    throw error;
  };

  if (!isApiRequest) {
    return next(req);
  }

  if (!currentUser) {
    return next(req).pipe(catchError(handleAuthErrors));
  }

  return from(currentUser.getIdToken()).pipe(
    catchError(() => of(null)),
    switchMap((token) => {
      const authReq = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : req;
      return next(authReq).pipe(catchError(handleAuthErrors));
    }),
  );
};
