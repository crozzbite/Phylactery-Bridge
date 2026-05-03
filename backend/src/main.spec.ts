import { buildCorsOptions, resolveDocsConfig } from './bootstrap/bootstrap-config';

describe('main bootstrap config', () => {
  describe('buildCorsOptions', () => {
    it('uses env-driven origins with credentials enabled', () => {
      const cors = buildCorsOptions({
        nodeEnv: 'development',
        corsAllowedOrigins: ['http://localhost:8100', 'http://localhost:4200'],
      });

      expect(cors).toEqual({
        origin: ['http://localhost:8100', 'http://localhost:4200'],
        credentials: true,
      });
    });

    it('fails closed in production when no explicit origins are configured', () => {
      expect(() =>
        buildCorsOptions({
          nodeEnv: 'production',
          corsAllowedOrigins: [],
        }),
      ).toThrow('CORS_ALLOWED_ORIGINS must include at least one origin in production');
    });
  });

  describe('resolveDocsConfig', () => {
    it('returns disabled docs with default path when docs flag is false', () => {
      expect(
        resolveDocsConfig({
          docsEnabled: false,
          docsPath: undefined,
        }),
      ).toEqual({
        enabled: false,
        path: 'api/docs',
      });
    });

    it('keeps configurable docs path when docs are enabled', () => {
      expect(
        resolveDocsConfig({
          docsEnabled: true,
          docsPath: 'api/internal-docs',
        }),
      ).toEqual({
        enabled: true,
        path: 'api/internal-docs',
      });
    });
  });
});
