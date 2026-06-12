import { describe, expect, it } from 'vitest';
import { tokenStorage } from '../utils/tokenStorage';

describe('tokenStorage', () => {
  it('stores and retrieves access token', () => {
    tokenStorage.setAccessToken('test-token');
    expect(tokenStorage.getAccessToken()).toBe('test-token');
    tokenStorage.clearAll();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('stores and retrieves user object', () => {
    const user = { id: '1', name: 'Test' };
    tokenStorage.setUser(user);
    expect(tokenStorage.getUser()).toEqual(user);
    tokenStorage.clearAll();
  });
});
