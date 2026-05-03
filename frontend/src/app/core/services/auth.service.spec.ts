import { isFullyAuthenticatedState } from './auth.service';

describe('AuthService authentication state contract', () => {
  it('reports fully authenticated only when firebase user exists and internal user is resolved', () => {
    expect(isFullyAuthenticatedState(true, true)).toBeTrue();
    expect(isFullyAuthenticatedState(true, false)).toBeFalse();
    expect(isFullyAuthenticatedState(true, null)).toBeFalse();
    expect(isFullyAuthenticatedState(false, true)).toBeFalse();
  });
});
