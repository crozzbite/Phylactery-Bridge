import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const createUrlTreeSpy = jasmine.createSpy('createUrlTree').and.callFake((commands, extras) => ({
    commands,
    extras,
  }) as unknown as UrlTree);

  const authServiceMock = {
    currentUser: jasmine.createSpy('currentUser'),
    internalUserResolved: jasmine.createSpy('internalUserResolved'),
  };

  beforeEach(() => {
    createUrlTreeSpy.calls.reset();
    authServiceMock.currentUser.calls.reset();
    authServiceMock.internalUserResolved.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: { createUrlTree: createUrlTreeSpy } },
      ],
    });
  });

  it('allows route when fully authenticated state is satisfied', () => {
    authServiceMock.currentUser.and.returnValue({ uid: 'firebase-uid' });
    authServiceMock.internalUserResolved.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBeTrue();
  });

  it('redirects to login when no firebase user exists', () => {
    authServiceMock.currentUser.and.returnValue(null);
    authServiceMock.internalUserResolved.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({
      commands: ['/login'],
      extras: undefined,
    } as unknown as UrlTree);
  });

  it('redirects to onboarding-first login when firebase user is unresolved internally', () => {
    authServiceMock.currentUser.and.returnValue({ uid: 'firebase-uid' });
    authServiceMock.internalUserResolved.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { intent: 'onboarding' },
    });
    expect(result).toEqual({
      commands: ['/login'],
      extras: { queryParams: { intent: 'onboarding' } },
    } as unknown as UrlTree);
  });
});
