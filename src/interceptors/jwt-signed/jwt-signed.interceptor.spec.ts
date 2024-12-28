import { JwtSignedInterceptor } from './jwt-signed.interceptor';

describe('JwtSignedInterceptor', () => {
  it('should be defined', () => {
    expect(new JwtSignedInterceptor()).toBeDefined();
  });
});
