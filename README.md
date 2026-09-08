# ⚙️ AWS Rentals Backend API

> **AI-powered property management backend API** — part of [AWS Rentals](https://github.com/mnmballa2323/aws.rentals)

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)]()
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)]()
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)]()

## Overview

The AWS Rentals Backend is the central service coordinating all property management operations, including:
- **8 Autonomous Gemini AI Agents** (Leasing, Maintenance, Financial, Legal Compliance, Tenant Relations, Market Analyst, Vendor Coordinator, Property Inspector)
- **Financial Services** (Stripe ACH/Card payments, Plaid bank linking, trust accounting, depreciation)
- **Leasing & Applications** (Fair Housing compliance, adverse action notices, screening via Checkr)
- **Property & Operations Data** (ATTOM Data integration, maintenance workflows, inspections)
- **Multi-Portal Access Control** (RBAC for Tenants, Property Managers, Owners, and Admins)

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker Compose)

### 1. Environment Setup
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default |
|---|---|---|
| `PORT` | API Server Port | `3000` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/rental_home?schema=public` |
| `CORS_ORIGINS` | Permitted origins | Portals on `:3000`, `:3001`, `:3002`, `:3003`, `:3004` |
| `GEMINI_API_KEY` | Google Gemini API key | Optional in mock dev mode |

### 2. Install & Generate Database Client
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 3. Run Development Server
```bash
npm run dev
```
The API server starts on **http://localhost:3000**.
- Health Check: `http://localhost:3000/health`
- API v1 Base: `http://localhost:3000/api/v1`

---

## API Routes Overview

| Base Path | Description |
|---|---|
| `/health` | Health and uptime status |
| `/ready` | Readiness check for container environments |
| `/api/v1/agents` | AI Agent coordination and chat execution |
| `/api/v1/properties` | Property listings, creation, metrics, and details |
| `/api/v1/units` | Rental unit availability, leases, pricing |
| `/api/v1/leasing` | Applications, screening, compliance, and deposit rules |
| `/api/v1/financial` | Stripe payments, Plaid linking, ledger, trust accounting |
| `/api/v1/operations` | Work orders, maintenance dispatch, inspections |
| `/api/v1/attom` | Property valuation, hazard scores, school ratings |
| `/api/v1/users` | User profiles, role permissions, notifications |

---

## Docker Deployment

Build and run using Docker:
```bash
docker build -t aws-rentals-backend .
docker run -p 3000:3000 --env-file .env aws-rentals-backend
```
