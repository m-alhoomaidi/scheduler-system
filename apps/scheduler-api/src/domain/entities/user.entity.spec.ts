import { User } from './user.entity';

describe('User Entity', () => {
  it('hashes password and validates fields', () => {
    const user = new User(
      'u1',
      'johnsmith',
      'password123',
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
    expect(user.username).toBe('johnsmith');
    expect(user.password).not.toBe('password123');
    expect(user.password).toHaveLength(64); // sha256 hex
  });

  it('throws on invalid username length', () => {
    expect(
      () =>
        new User(
          'u1',
          'ab',
          'password123',
          'USER',
          null,
          null,
          new Date(),
          new Date(),
          null,
        ),
    ).toThrow();
  });

  it('throws on invalid password length when not hashed', () => {
    expect(
      () =>
        new User(
          'u1',
          'validname',
          'short',
          'USER',
          null,
          null,
          new Date(),
          new Date(),
          null,
        ),
    ).toThrow();
  });

  it('accepts pre-hashed passwords when isHashed flag is true', () => {
    const preHashed = 'a'.repeat(64);
    const user = new User(
      'u1',
      'validname',
      preHashed,
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
      { isHashed: true },
    );
    expect(user.password).toBe(preHashed);
  });

  it('throws on invalid role', () => {
    expect(
      () =>
        new User(
          'u1',
          'validname',
          'password123',
          'INVALID' as any,
          null,
          null,
          new Date(),
          new Date(),
          null,
        ),
    ).toThrow();
  });

  it('skipValidation allows invalid lengths and roles (still hashes when not isHashed)', () => {
    const user = new User(
      'u1',
      'ab',
      'short',
      'INVALID' as any,
      null,
      null,
      new Date(),
      new Date(),
      null,
      { skipValidation: true },
    );
    expect(user.password).toHaveLength(64);
  });

  it('hashPassword is deterministic and different from plaintext', () => {
    const u = new User(
      'u1',
      'johnsmith',
      'password123',
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
    const h1 = u.hashPassword('abc12345');
    const h2 = u.hashPassword('abc12345');
    expect(h1).toEqual(h2);
    expect(h1).not.toEqual('abc12345');
    expect(h1).toHaveLength(64);
  });

  it('validateUsername boundaries', () => {
    const u = new User(
      'u1',
      'johnsmith',
      'password123',
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
    expect(u.validateUsername('abc')).toBe(false); // length 3 invalid per >3
    expect(u.validateUsername('abcd')).toBe(true); // 4
    expect(u.validateUsername('a'.repeat(19))).toBe(true); // 19
    expect(u.validateUsername('a'.repeat(20))).toBe(false); // <20
  });

  it('validatePassword boundaries', () => {
    const u = new User(
      'u1',
      'johnsmith',
      'password123',
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
    expect(u.validatePassword('a'.repeat(7))).toBe(false);
    expect(u.validatePassword('a'.repeat(8))).toBe(true);
    expect(u.validatePassword('a'.repeat(20))).toBe(true);
    expect(u.validatePassword('a'.repeat(21))).toBe(false);
  });

  it('validateRole allows only USER and ADMIN', () => {
    const u = new User(
      'u1',
      'johnsmith',
      'password123',
      'USER',
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
    expect(u.validateRole('USER')).toBe(true);
    expect(u.validateRole('ADMIN')).toBe(true);
    expect(u.validateRole('GUEST' as any)).toBe(false);
  });
});
