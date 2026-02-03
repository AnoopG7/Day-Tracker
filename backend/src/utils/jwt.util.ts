import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // Issued at (added by JWT)
  exp?: number; // Expiration time (added by JWT)
}

export const generateToken = (userId: string, email?: string, role?: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const payload: JWTPayload = {
    userId,
    email: email || '',
    role: role || '',
  };

  // @ts-ignore - expiresIn type mismatch with jsonwebtoken types
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
};
