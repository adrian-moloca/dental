import { ConflictResolver } from '../../src/sync/conflict-resolution';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  test('should merge objects with server precedence', () => {
    const client = { name: 'Client', value: 1, shared: 'client' };
    const server = { name: 'Server', shared: 'server', extra: 'data' };

    const merged = (resolver as any).mergeObjects(client, server);

    expect(merged).toEqual({
      name: 'Server',
      value: 1,
      shared: 'server',
      extra: 'data'
    });
  });

  test('should handle nested object merging', () => {
    const client = {
      user: { name: 'Client', age: 25 },
      settings: { theme: 'dark' }
    };

    const server = {
      user: { name: 'Server', email: 'server@test.com' },
      settings: { theme: 'light', lang: 'en' }
    };

    const merged = (resolver as any).mergeObjects(client, server);

    expect(merged.user.name).toBe('Server');
    expect(merged.user.age).toBe(25);
    expect(merged.user.email).toBe('server@test.com');
    expect(merged.settings.theme).toBe('light');
  });

  test('should handle primitive values', () => {
    const merged = (resolver as any).mergeObjects('client', 'server');
    expect(merged).toBe('server');
  });

  test('should handle arrays', () => {
    const client = { items: [1, 2] };
    const server = { items: [3, 4] };

    const merged = (resolver as any).mergeObjects(client, server);
    expect(merged.items).toEqual([3, 4]);
  });
});
