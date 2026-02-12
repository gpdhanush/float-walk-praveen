# StyleFlow Retail – Backend

Enterprise-grade Node.js backend for Retail Footwear Billing SaaS.

## Tech Stack

- **Node.js** (LTS 20+)
- **Express.js**
- **MySQL** (mysql2)
- **JWT** (access + refresh, httpOnly cookie for refresh)
- **bcrypt** (password hashing)
- **UUID** primary keys
- **Clean Architecture** (DDD-style)
- **REST APIs**
- **Redis** (caching + BullMQ)
- **BullMQ** (job queue: email, WhatsApp, reminders, alerts)
- **Winston** (logging)
- **Joi** (validation)
- **Swagger** (API docs)
- **Docker** ready

## Project Structure

```
src/
  domain/           # Entities & repository interfaces
  application/      # Services & use-cases
  infrastructure/   # DB, Redis, queues
  interfaces/       # Controllers, routes, validators, middlewares
  config/
  utils/
  tests/
```

## Setup

### Prerequisites

- Node.js 20+
- MySQL 8
- Redis 7 (optional; see “Running without Redis” below)

### Environment

Copy `.env.example` to `.env` and set:

```bash
cp .env.example .env
```

Required variables:

- `MYSQL_*` – MySQL connection
- `REDIS_*` – Redis connection (optional if `REDIS_ENABLED=false`)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (min 32 chars in production)
- `CORS_ORIGINS` – Comma-separated allowed origins

### Running without Redis

For local development without Redis, set in `.env`:

```bash
REDIS_ENABLED=false
```

With Redis disabled:

- Caching is skipped (cache reads return miss, writes no-op).
- BullMQ workers are not started; email/WhatsApp/reminder/alert jobs are no-ops (enqueue calls succeed but nothing is processed).
- The server starts without requiring a Redis instance and no connection errors are logged.

### Database

Create database and run migrations:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS styleflow_retail;"
npm run migrate
```

### Install & Run

```bash
npm install
npm run dev
```

- API: http://localhost:3001
- Swagger: http://localhost:3001/api-docs
- Health: http://localhost:3001/health
- Metrics: http://localhost:3001/metrics

## Docker

Run API + MySQL + Redis:

```bash
# Ensure MySQL is initialized (first run): run api once to trigger migration or run schema manually
docker-compose up -d mysql redis
# Then run migration from host if needed, or add init script to MySQL container
docker-compose up -d api
```

For local dev with Docker only for MySQL/Redis:

```bash
docker-compose up -d mysql redis
npm run dev
```

## API Overview

| Module        | Base Path     | Auth |
|---------------|---------------|------|
| Auth          | `/api/auth`   | No   |
| Users         | `/api/users`  | Admin |
| Customers     | `/api/customers` | JWT |
| Invoices      | `/api/invoices`  | JWT |
| Measurements  | `/api/measurements` | JWT |
| Expenses      | `/api/expenses`   | JWT |
| Purchases     | `/api/purchases`  | JWT |
| Stock         | `/api/stock`     | JWT |
| Reports       | `/api/reports`   | JWT |
| Settings      | `/api/settings`  | JWT |

### Auth

- `POST /api/auth/login` – Login (returns accessToken; refreshToken in httpOnly cookie)
- `POST /api/auth/logout` – Logout (clears cookie)
- `POST /api/auth/refresh` – Refresh tokens (body or cookie)

Send access token: `Authorization: Bearer <accessToken>`.

### Human-readable codes

- Invoices: `INV0001`, `INV0002`, …
- Expenses: `EXP0001`, …
- Measurements: `MEA0001`, …
- Stock logs: `STK0001`, …
- Purchases: `PUR0001`, …

## Tests

```bash
npm test
```

Target: ≥70% coverage (unit + integration).

## Security

- Helmet, CORS whitelist, rate limiting
- Parameterized queries (SQL injection prevention)
- Password strength (min 8 chars, upper, lower, number, special)
- XSS protection via Helmet and safe responses

## License

Proprietary.
