
export const mockFirebaseAdmin = {
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
};

export const mockUserRecord = {
  uid: 'test-uid',
  email: 'test@phylactery.ai',
  displayName: 'Test User',
};

export const mockDecodedToken = {
  uid: 'test-uid',
  email: 'test@phylactery.ai',
  iss: 'https://securetoken.google.com/phylactery-bridge',
  aud: 'phylactery-bridge',
  auth_time: 1234567890,
  sub: 'test-uid',
  iat: 1234567890,
  exp: 1234567890,
  firebase: {
    identities: {},
    sign_in_provider: 'password',
  },
};
