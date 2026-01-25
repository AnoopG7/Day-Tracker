import { Request, Response, NextFunction } from 'express';

/**
 * Request logger middleware
 * Logs all requests in development mode
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_REQUEST_LOGGING) {
    return next();
  }

  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const resetColor = '\x1b[0m';

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${resetColor} ${duration}ms`
    );
  });

  next();
};
