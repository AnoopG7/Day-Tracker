import { User } from '../../src/models/index.js';
import { generateToken } from '../../src/utils/jwt.util.js';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  token: string;
}

/**
 * Create a test user and return user data with auth token
 */
export const createTestUser = async (overrides?: Partial<{
  name: string;
  email: string;
  password: string;
}>): Promise<TestUser> => {
  const userData = {
    name: overrides?.name || 'Test User',
    email: overrides?.email || `test-${Date.now()}@example.com`,
    password: overrides?.password || 'password123',
  };

  const user = await User.create(userData);
  const token = generateToken(user._id.toString(), user.email);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    token,
  };
};

/**
 * Get authorization header for a test user
 */
export const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
