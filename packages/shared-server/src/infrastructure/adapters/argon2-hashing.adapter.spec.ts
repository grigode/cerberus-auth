import { Argon2HashingAdapter } from './argon2-hashing.adapter';

describe('Argon2HashingAdapter', () => {
  let adapter: Argon2HashingAdapter;

  beforeEach(() => {
    adapter = new Argon2HashingAdapter();
  });

  it('should hash a plain text string and verify successfully', async () => {
    const plain = 'mySecurePassword123!';
    const hashed = await adapter.hash(plain);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(plain);

    const isValid = await adapter.compare(plain, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await adapter.compare('wrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });
});
