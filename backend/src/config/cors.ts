import cors, { CorsOptions } from 'cors';

const NODE_ENV = process.env.NODE_ENV || 'development';

// Define allowed origins based on environment
const allowedOrigins: Record<string, string[]> = {
  development: ['http://localhost:5173', 'http://localhost:3000'],
  production: [
    // Add your production frontend URLs here
    // 'https://your-frontend-domain.com',
  ],
  test: ['http://localhost:5173'],
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const origins = allowedOrigins[NODE_ENV] || allowedOrigins.development;

    // Allow requests with no origin (direct browser access, mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow if origin is in the list, or if in development mode allow all
    if (origins.includes(origin) || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);
