import { signInSchema, signUpSchema } from './auth.schema';

describe('auth schemas', () => {
  it('accepts a valid sign-in payload', () => {
    expect(signInSchema.safeParse({
      email: 'person@example.com',
      password: 'correct-horse-battery'
    }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(signInSchema.safeParse({
      email: 'not-an-email',
      password: 'correct-horse-battery'
    }).success).toBe(false);
  });

  it('requires a full name for sign-up', () => {
    expect(signUpSchema.safeParse({
      fullName: '',
      email: 'person@example.com',
      password: 'correct-horse-battery'
    }).success).toBe(false);
  });
});
