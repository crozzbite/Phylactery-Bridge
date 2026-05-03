import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const navigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);
  const authServiceMock = {
    clearLocalAuthExpectation: jasmine.createSpy('clearLocalAuthExpectation'),
    setInternalUserResolved: jasmine.createSpy('setInternalUserResolved'),
  };

  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authMock: { currentUser: { getIdToken: () => Promise<string> } | null };

  beforeEach(() => {
    navigateSpy.calls.reset();
    authServiceMock.clearLocalAuthExpectation.calls.reset();
    authServiceMock.setInternalUserResolved.calls.reset();

    authMock = {
      currentUser: {
        getIdToken: () => Promise.resolve('firebase-token'),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authMock },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches firebase token to API requests', fakeAsync(() => {
    let received: { hasAccess?: boolean; role?: string } | undefined;
    http
      .get<{ hasAccess: boolean; role: string }>(`${environment.apiUrl}/beta/status`)
      .subscribe({ next: (resp) => { received = resp; } });

    tick();

    const req = httpMock.expectOne(`${environment.apiUrl}/beta/status`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer firebase-token');
    req.flush({ hasAccess: true, role: 'beta_user' });

    expect(received?.hasAccess).toBeTrue();
  }));

  it('does not attach token to non-API requests', () => {
    http.get('/assets/config.json').subscribe();

    const req = httpMock.expectOne('/assets/config.json');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('handles 401 by clearing auth expectation and routing to login', fakeAsync(() => {
    let caughtError: HttpErrorResponse | undefined;
    http.get(`${environment.apiUrl}/secure`).subscribe({
      next: () => fail('expected 401'),
      error: (error: HttpErrorResponse) => { caughtError = error; },
    });

    tick();

    const req = httpMock.expectOne(`${environment.apiUrl}/secure`);
    req.flush({ message: 'Invalid or expired token' }, { status: 401, statusText: 'Unauthorized' });

    expect(caughtError?.status).toBe(401);
    expect(authServiceMock.clearLocalAuthExpectation).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('routes unresolved identity (403) to onboarding-first login', fakeAsync(() => {
    let caughtError: HttpErrorResponse | undefined;
    http.get(`${environment.apiUrl}/secure`).subscribe({
      next: () => fail('expected 403'),
      error: (error: HttpErrorResponse) => { caughtError = error; },
    });

    tick();

    const req = httpMock.expectOne(`${environment.apiUrl}/secure`);
    req.flush(
      { statusCode: 403, code: 'IDENTITY_NOT_RESOLVED', message: 'IDENTITY_NOT_RESOLVED' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(caughtError?.status).toBe(403);
    expect(authServiceMock.setInternalUserResolved).toHaveBeenCalledWith(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { intent: 'onboarding' },
    });
  }));

  it('routes generic 403 to beta gate flow', fakeAsync(() => {
    let caughtError: HttpErrorResponse | undefined;
    http.get(`${environment.apiUrl}/secure`).subscribe({
      next: () => fail('expected 403'),
      error: (error: HttpErrorResponse) => { caughtError = error; },
    });

    tick();

    const req = httpMock.expectOne(`${environment.apiUrl}/secure`);
    req.flush({ message: 'Beta access required' }, { status: 403, statusText: 'Forbidden' });

    expect(caughtError?.status).toBe(403);
    expect(navigateSpy).toHaveBeenCalledWith(['/beta-gate']);
  }));
});
