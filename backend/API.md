# Day-Tracker API Documentation

**Base URL:** `http://localhost:3000/api`

**Authentication:** Bearer token in `Authorization` header

---

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Check if API is running. Returns status and timestamp. |

---

## Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create a new user account. Returns user info and JWT token. |
| POST | `/auth/login` | ❌ | Authenticate user with email/password. Returns JWT token for subsequent requests. |
| GET | `/auth/me` | ✅ | Get current logged-in user's profile including name, email, and avatar. |
| PUT | `/auth/profile` | ✅ | Update user profile (name, phone, avatar URL). |
| PUT | `/auth/update-password` | ✅ | Change password. Requires current password verification. |
| POST | `/auth/forgot-password` | ❌ | Request password reset email. Generates reset token valid for 10 minutes. |
| POST | `/auth/reset-password` | ❌ | Reset password using token from email. Invalidates the reset token after use. |
| DELETE | `/auth/account` | ✅ | Soft-delete user account. Requires password confirmation for security. |
| GET | `/auth/users` | ✅ | Get all active users (admin endpoint). Paginated list. |

---

## DayLog Routes

Daily logs for tracking sleep, exercise, and notes.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/daylogs` | ✅ | Get all daylogs with pagination. Supports `?startDate=&endDate=` filters. |
| GET | `/daylogs/today` | ✅ | Get or auto-create today's daylog. Creates empty log if none exists. |
| GET | `/daylogs/streak` | ✅ | Get current and longest streak. **Streak counts if sleep OR exercise logged.** |
| GET | `/daylogs/summary/week` | ✅ | Get weekly summary with sleep average and exercise totals. |
| GET | `/daylogs/:date` | ✅ | Get daylog for specific date (YYYY-MM-DD format). |
| POST | `/daylogs` | ✅ | Create or update daylog (upsert). Includes sleep, exercise, and notes. |
| PUT | `/daylogs/:date` | ✅ | Update existing daylog by date. Partial updates allowed. |
| DELETE | `/daylogs/:date` | ✅ | Delete daylog for specific date. |

---

## Dashboard Routes

Single endpoint to fetch all daily data in one request. Ideal for frontend daily view.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | ✅ | Get aggregated daily data. Supports `?date=YYYY-MM-DD` (defaults to today). |

**Response includes:**
- DayLog (sleep, exercise, notes)
- Custom activities with total minutes
- Nutrition entries with macro totals
- Expense entries with category breakdown

---

## Custom Activities Routes

Track custom activities like reading, meditation, coding, etc.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/activities` | ✅ | Get all activities with pagination. Supports `?date=&startDate=&endDate=`. |
| GET | `/activities/stats` | ✅ | Get activity statistics - most frequent activities and total time spent. |
| GET | `/activities/date/:date` | ✅ | Get all activities for a specific date. |
| GET | `/activities/:id` | ✅ | Get single activity by ID. |
| POST | `/activities` | ✅ | Create new activity. Provide duration OR start/end times. |
| PUT | `/activities/:id` | ✅ | Update activity by ID. |
| DELETE | `/activities/:id` | ✅ | Delete activity by ID. |

---

## Nutrition Routes

Track meals and macros (calories, protein, carbs, fats).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/nutrition` | ✅ | Get nutrition entries with pagination. Supports `?date=&mealType=`. |
| GET | `/nutrition/summary/daily` | ✅ | Get daily macro totals (calories, protein, carbs, fats) for a date. |
| GET | `/nutrition/summary/weekly` | ✅ | Get weekly nutrition breakdown with averages per day. |
| GET | `/nutrition/:id` | ✅ | Get single nutrition entry by ID. |
| POST | `/nutrition` | ✅ | Create nutrition entry with meal type and macros. |
| PUT | `/nutrition/:id` | ✅ | Update nutrition entry by ID. |
| DELETE | `/nutrition/:id` | ✅ | Delete nutrition entry by ID. |

---

## Expense Routes

Track daily expenses with categories and payment methods.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/expenses` | ✅ | Get expenses with pagination. Supports `?date=&category=&startDate=&endDate=`. |
| GET | `/expenses/summary/daily` | ✅ | Get daily expense total grouped by category and payment method. |
| GET | `/expenses/summary/monthly` | ✅ | Get monthly breakdown with daily totals and category summary. |
| GET | `/expenses/by-category` | ✅ | Get category breakdown with percentages (for pie charts). |
| GET | `/expenses/:id` | ✅ | Get single expense by ID. |
| POST | `/expenses` | ✅ | Create expense entry with amount, category, and description. |
| PUT | `/expenses/:id` | ✅ | Update expense by ID. |
| DELETE | `/expenses/:id` | ✅ | Delete expense by ID. |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## Rate Limits

| Route | Limit |
|-------|-------|
| Global | 100 requests / 15 min |
| Login/Register | 10 requests / 15 min |
| Password Reset | 5 requests / hour |

---

## Common Query Parameters

| Param | Description | Example |
|-------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (default: 50, max: 100) | `?limit=20` |
| `startDate` | Filter from date (YYYY-MM-DD) | `?startDate=2026-01-01` |
| `endDate` | Filter to date (YYYY-MM-DD) | `?endDate=2026-01-31` |
| `date` | Filter exact date | `?date=2026-01-25` |
