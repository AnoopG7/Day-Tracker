import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Simple in-memory rate limiter (no external dependencies)
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const createRateLimiter = (options: {
  windowMs: number;
  limit: number;
  message: object;
}): RequestHandler => {
  const store: RateLimitStore = {};

  // Cleanup old entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, 60000);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = { count: 1, resetTime: now + options.windowMs };
    } else {
      store[key].count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - store[key].count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));

    if (store[key].count > options.limit) {
      res.status(429).json(options.message);
      return;
    }

    next();
  };
};

/**
 * Global rate limiter - 100 requests per 15 minutes
 */
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Strict rate limiter for auth routes - 10 requests per 15 minutes
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Strict rate limiter for password reset - 5 requests per hour
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    error: {
      message: 'Too many password reset attempts, please try again later',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Security headers middleware (helmet replacement)
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content-Security-Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};
