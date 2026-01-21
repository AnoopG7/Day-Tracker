import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;  // Issued at (added by JWT)
  exp?: number;  // Expiration time (added by JWT)
}

export const generateToken = (userId: string, email?: string, role?: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  const payload: JWTPayload = {
    userId,
    email: email || '',
    role: role || ''
  };

  // @ts-ignore - expiresIn type mismatch with jsonwebtoken types
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
