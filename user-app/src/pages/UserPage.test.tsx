import { describe, expect, it } from 'vitest';

describe('UserPage module', () => {
  it('loads without runtime import errors', async () => {
    const mod = await import('./UserPage');
    expect(mod.default).toBeTypeOf('function');
  });
});
