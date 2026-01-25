# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Day-Tracker backend API.

| Metric | Value |
|--------|-------|
| **Test Suites** | 26 |
| **Tests** | 317 |
| **Coverage** | 90.08% |
| **Framework** | Jest + ts-jest |
| **Database** | MongoDB Memory Server |

---

## Coverage Report

| Category | Statements | Branches | Functions | Lines |
|----------|-----------|----------|-----------|-------|
| **Overall** | 90.08% | 70.18% | 94.23% | 91.13% |
| **Controllers** | 90.24% | 66.92% | 100% | 90.45% |
| **Middlewares** | 93.96% | 89.28% | 93.33% | 93.91% |
| **Models** | 90.38% | 77.41% | 100% | 93.87% |
| **Routes** | 98.33% | 100% | - | 98.33% |
| **Utils** | 100% | 93.1% | 100% | 100% |

---

## Test Structure

```
tests/
├── setup.ts                            # Global setup with MongoDB Memory Server
├── helpers/
│   └── auth.helper.ts                  # Auth utilities for tests
├── unit/
│   ├── config/
│   │   ├── cors.test.ts                # CORS configuration
│   │   └── db.test.ts                  # Database connection
│   ├── utils/
│   │   ├── password.util.test.ts       # Password hashing/comparison
│   │   ├── jwt.util.test.ts            # Token generation/verification
│   │   ├── apiResponse.util.test.ts    # API response helpers
│   │   └── errors.test.ts              # Custom error classes
│   ├── models/
│   │   ├── user.model.test.ts          # User model validation
│   │   ├── daylog.model.test.ts        # DayLog model
│   │   ├── nutrition.model.test.ts     # Nutrition entries
│   │   ├── expense.model.test.ts       # Expense entries
│   │   └── customactivity.model.test.ts
│   ├── middlewares/
│   │   ├── auth.middleware.test.ts     # JWT authentication
│   │   ├── error.middleware.test.ts    # Error handling
│   │   ├── logger.middleware.test.ts   # Request logging
│   │   └── security.middleware.test.ts # Security headers & rate limiting
│   └── validations/
│       ├── auth.validation.test.ts
│       ├── daylog.validation.test.ts
│       ├── expense.validation.test.ts
│       ├── nutrition.validation.test.ts
│       └── customactivity.validation.test.ts
└── integration/
    ├── auth.test.ts                    # Auth endpoints (10 tests)
    ├── daylog.test.ts                  # DayLog CRUD (12 tests)
    ├── nutrition.test.ts               # Nutrition CRUD (13 tests)
    ├── expense.test.ts                 # Expense CRUD (18 tests)
    ├── activity.test.ts                # Custom activities (15 tests)
    └── dashboard.test.ts               # Dashboard aggregation
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern="auth"

# Run in watch mode
npm run test:watch
```

---

## Test Categories

### Unit Tests (160+ tests)

#### Config
- **cors.test.ts** - CORS origin validation, methods, headers
- **db.test.ts** - MongoDB connection, event handlers, graceful shutdown

#### Utils
- **password.util.test.ts** - Hash generation, password comparison, edge cases
- **jwt.util.test.ts** - Token generation, verification, expiration handling
- **apiResponse.util.test.ts** - Success/error response helpers
- **errors.test.ts** - All custom error classes (ApiError, NotFoundError, etc.)

#### Models
- **user.model.test.ts** - Validation, password hashing hook, comparePassword method
- **daylog.model.test.ts** - Sleep/exercise entries, unique constraints
- **nutrition.model.test.ts** - Meal types, calorie tracking
- **expense.model.test.ts** - Categories, payment methods
- **customactivity.model.test.ts** - Reserved names, time/duration validation

#### Middlewares
- **auth.middleware.test.ts** - Token verification, role authorization
- **error.middleware.test.ts** - Error types (validation, JWT, MongoDB)
- **logger.middleware.test.ts** - Request logging, production vs development
- **security.middleware.test.ts** - Security headers, rate limiting

#### Validations
- Tests for all Zod schemas (create/update operations)
- Edge cases and refinement logic

### Integration Tests (140+ tests)

#### Authentication (10 tests)
- Register, login, logout
- Profile management
- Password reset flow
- Account deletion

#### DayLog (12 tests)
- Create/update (upsert) daylogs
- Get today's daylog
- Streak calculation
- Weekly summaries
- Date range filtering
- Pagination

#### Nutrition (13 tests)
- CRUD operations
- Daily summaries
- Weekly summaries
- Meal type filtering
- Date range filtering

#### Expense (18 tests)
- CRUD operations
- Category breakdown
- Monthly summaries
- Daily summaries
- Payment method tracking
- Pagination and filtering

#### Custom Activities (15 tests)
- CRUD operations
- Activity statistics
- Date filtering
- Reserved name validation
- Time/duration validation

#### Dashboard
- Aggregated daily data
- Multi-resource queries

---

## Module Breakdown

#### Controllers (90.24%)
- **expense.controller.ts** - 99% 
- **nutrition.controller.ts** - 97.43% 
- **customactivity.controller.ts** - 90.9% 
- **daylog.controller.ts** - 87.5% 
- **dashboard.controller.ts** - 84.84% 
- **auth.controller.ts** - 78.82%

#### Middlewares (93.96%)
- **auth.middleware.ts** - 100% 
- **logger.middleware.ts** - 100% 
- **error.middleware.ts** - 95%
- **validation.middleware.ts** - 92.3%
- **security.middleware.ts** - 87.5%

#### Models (90.38%)
- **expense.model.ts** - 100% 
- **nutrition.model.ts** - 100% 
- **user.model.ts** - 100% 
- **daylog.model.ts** - 86.66%
- **customactivity.model.ts** - 80%

#### Utils (100%)
- All utility files have perfect coverage

#### Routes (98.33%)
- All route files have excellent coverage

---

## Coverage Thresholds

The project maintains the following coverage standards:

| Metric | Target | Current |
|--------|--------|---------|
| **Statements** | 80%+ | 90.08% |
| **Branches** | 70%+ | 70.18% |
| **Functions** | 80%+ | 94.23% |
| **Lines** | 80%+ | 91.13% |

---

## Test Helpers

### `auth.helper.ts`
```typescript
// Create test user with token
const { user, token } = await createTestUser();

// Auth header helper
const auth = authHeader(token);
// Usage: request(app).get('/api/auth/me').set(auth)
```

---


## Writing New Tests

### Unit Test Pattern
```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature', () => {
  describe('method', () => {
    it('should do something', () => {
      expect(result).toBe(expected);
    });
  });
});
```

### Integration Test Pattern
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('API Route', () => {
  let token: string;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    token = testUser.token;
  });

  it('should return data', async () => {
    const res = await request(app)
      .get('/api/resource')
      .set(authHeader(token));
    
    expect(res.status).toBe(200);
  });
});
```

---

## Common Test Utilities

| Utility | Description |
|---------|-------------|
| `createTestUser()` | Creates user with auth token |
| `authHeader()` | Returns Authorization header object |
| `jest.fn()` | Mock functions |
| `expect.objectContaining()` | Partial object matching |

---

## Notes

- Tests run in isolation with fresh MongoDB for each suite
- All tests use ESM imports (`.js` extensions required)
- Jest globals imported from `@jest/globals`
- MongoDB Memory Server auto-starts/stops per test run
- Test environment detected and handled appropriately
- Rate limiters and loggers skip in test mode

---

## Test Features

### What's Tested

**Authentication & Authorization**
- User registration and login
- JWT token generation and verification
- Password hashing and comparison
- Password reset flow
- Profile updates
- Role-based access control

**CRUD Operations**
- All resources (DayLog, Nutrition, Expense, Activities)
- Create, Read, Update, Delete
- 404 error handling
- Validation errors
- User isolation (can't access other users' data)

**Data Validation**
- Zod schema validation
- Model-level validation
- Business rule enforcement
- Edge cases and boundaries

**Filtering & Pagination**
- Date filtering (single date, date range)
- Category/type filtering
- Pagination with page/limit
- Sorting and ordering

**Aggregations & Summaries**
- Daily summaries (nutrition, expenses)
- Weekly summaries (nutrition, daylogs)
- Monthly summaries (expenses)
- Category breakdowns
- Streak calculations

**Security**
- Rate limiting (global, auth, password reset)
- Security headers
- CORS configuration
- Error message safety

**Error Handling**
- Custom error classes
- MongoDB errors (duplicate, validation, cast)
- JWT errors
- Global error handler

---

## Continuous Integration

The test suite is designed for CI/CD:
- Fast execution (~30s for full suite)
- No external dependencies
- Self-contained database
- Comprehensive coverage reports
- Zero flaky tests
- All tests passing
