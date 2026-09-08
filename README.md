# ClientFlow

ClientFlow is an enterprise client and project operations platform built with React, Node.js, Express, TypeScript, and Prisma ORM. It streamlines client relationship tracking, multi-phase project pipelines, Kanban task workflows, document asset management, role-based authorization, and organization activity auditing in a single unified system.

---

## Overview

ClientFlow provides digital agencies, software teams, and consulting organizations with a structured operational hub. The platform coordinates client accounts, project deliverables, and team assignments while maintaining an immutable audit log of organizational activity.

---

## Key Features

- **Client Management:** Maintain client accounts, track engagement status (`LEAD`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), record client notes, and manage primary and stakeholder contacts.
- **Project Tracking:** Plan and monitor projects with client associations, budget tracking, target/actual completion dates, priority tiers, and assigned team members.
- **Task Management & Kanban Board:** Track deliverables across list and interactive Kanban views with 5 lifecycle stages (`To Do`, `In Progress`, `Blocked`, `In Review`, `Done`), assignees, due dates, and priority levels.
- **Document Management:** Upload, organize, and download project specifications, architectural assets, and client documents with MIME-type validation and file size restrictions.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Full organization authority (user directory, account creation, client archiving, settings).
  - **Manager:** Create and manage clients, projects, team rosters, and task backlogs.
  - **Member:** Execute assigned tasks, update Kanban statuses, view assigned projects, and upload documents.
- **Activity Log & Audit Trail:** Automatic tracking capturing actor, action type, entity references, and metadata for traceable accountability.
- **Notifications:** In-app notification center tracking task assignments, project updates, and system events with unread badge tracking.
- **Authentication & Security:** Dual-token JWT authentication with rotating refresh tokens, bcrypt password hashing, input validation schemas, and security middleware.

---

## Tech Stack

### Frontend
- **React 18** (Functional components, hooks)
- **TypeScript** (Strict type safety)
- **Vite** (Build tooling and development server)
- **Tailwind CSS** (Design system and utility styling)
- **TanStack Query (React Query v5)** (Server state management and caching)
- **React Hook Form & Zod** (Form handling with schema validation)
- **React Router v6** (Client-side routing with route guards)
- **Lucide React** (UI iconography)
- **Axios** (HTTP client with JWT interceptors and refresh queuing)

### Backend
- **Node.js & Express** (RESTful API architecture)
- **TypeScript** (End-to-end typed contracts)
- **Prisma ORM** (Database schema management, type-safe queries, client generation)
- **Zod** (Request payload validation middleware)
- **Bcryptjs** (Secure credential hashing)
- **JSONWebToken** (Dual-token generation and verification)
- **Multer** (Multipart file upload handling with MIME validation)
- **Helmet & CORS** (Security headers and cross-origin resource policy)

### Database
- **SQLite (Default):** Configured via Prisma ORM for zero-setup, self-contained local evaluation (`file:./dev.db`).
- **PostgreSQL Ready:** Prisma relational schema with 10 entities and standard foreign keys, portable to PostgreSQL by updating the `provider` in `schema.prisma`.

### DevOps & Infrastructure
- **Docker & Docker Compose** (Multi-container orchestration for frontend, backend, and database)
- **Nginx** (Production frontend container reverse proxy and static asset serving)

---

## Architecture

ClientFlow follows a layered, decoupled client-server architecture:

```text
Browser (React SPA + TanStack Query + Axios)
       │
       ▼  [HTTP / REST + Bearer JWT]
API Gateway / Express Server
       │
       ├── Middleware Pipeline (Helmet, CORS, Auth Bearer Guard, RBAC Guard, Zod Validator)
       │
       ├── Controllers Layer (HTTP request/response handling)
       │
       ├── Services Layer (Business logic, transaction coordination, audit logging)
       │
       └── Prisma ORM Client (Type-safe data access)
               │
               ▼
       Relational Database (SQLite local / PostgreSQL production)
```

For full architectural diagrams and entity-relationship models, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Testing

The repository contains automated tests powered by **Vitest**:

- **Backend Integration Tests (24 tests):**
  - `tests/auth.test.ts` (9 tests): User registration, email format validation, password complexity constraints, duplicate email rejection (409), login validation, JWT payload verification, token refresh rotation, and logout token revocation.
  - `tests/rbac.test.ts` (5 tests): Role permission enforcement (preventing Member from creating clients, preventing Manager from archiving clients, verifying Admin-only endpoints).
  - `tests/operations.test.ts` (10 tests): Client creation and listing, Project lifecycle creation, Task assignment, Kanban status transitions (`TODO` → `IN_PROGRESS` → `DONE`), Activity Log audit trail creation, and Document metadata persistence.
- **Frontend Utility Tests (4 tests):**
  - `src/utils.test.ts` (4 tests): Status badge configuration, priority color mapping, currency formatting, and file-size byte formatting.

### Running Tests

Run backend test suite:
```bash
cd backend
npm test
```

Run frontend test suite:
```bash
cd frontend
npm test
```

Run all tests from root:
```bash
npm test
```

---

## Running Locally

### Prerequisites
- Node.js 18+ (tested on Node 22)
- npm 9+

### Quickstart (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vaibhavsam12/clientflow.git
   cd clientflow
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(The default `.env.example` comes pre-configured for instant local development with SQLite).*

3. **Install dependencies:**
   ```bash
   # From root, or install in each directory:
   npm --prefix backend install
   npm --prefix frontend install
   ```

4. **Initialize Database & Seed Sample Data:**
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed
   cd ..
   ```

5. **Start Development Servers:**

   In terminal 1 (Backend API on `http://localhost:5000`):
   ```bash
   npm run dev:backend
   ```

   In terminal 2 (Frontend on `http://localhost:5173`):
   ```bash
   npm run dev:frontend
   ```

6. Open `http://localhost:5173` in your browser.

---

### Demo Accounts

The database seed includes pre-configured accounts for testing role-based access:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `alex.admin@clientflow.io` | `Password123!` | Full administrative authority, user directory, client archiving |
| **Manager** | `sarah.manager@clientflow.io` | `Password123!` | Create clients, manage projects, assign team members and tasks |
| **Member** | `david.engineer@clientflow.io` | `Password123!` | Execute tasks, update Kanban status, upload project documents |

---

### Running with Docker

Docker Compose runs the full multi-container stack (Frontend, Backend API, and PostgreSQL):

```bash
docker-compose up --build
```

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:5000/api/health`

---

## Project Structure

```text
clientflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational data models (10 entities)
│   │   └── seed.ts             # Demo data seeder with role-based users
│   ├── src/
│   │   ├── config/             # Environment configuration & fallbacks
│   │   ├── controllers/        # HTTP controllers (auth, clients, projects, tasks, etc.)
│   │   ├── middleware/         # Auth guard, RBAC guard, Zod validation, error handler
│   │   ├── routes/             # Express API route declarations
│   │   ├── schemas/            # Zod request validation schemas
│   │   ├── services/           # Business logic, storage service, audit logging
│   │   ├── types/              # TypeScript interface definitions
│   │   ├── utils/              # Token utils, logger, application error classes
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entry point
│   ├── tests/                  # Integration test suite (auth, rbac, operations)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components (Kanban board, modals, layout, sidebar)
│   │   ├── context/            # AuthContext and ToastContext providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Dashboard, Clients, Projects, Tasks, Settings
│   │   ├── services/           # Axios API client, token refresh interceptor
│   │   ├── types/              # Shared frontend TypeScript types
│   │   ├── utils/              # Formatters, badge configs, helpers
│   │   ├── App.tsx             # Route configuration with ProtectedRoute wrappers
│   │   └── main.tsx            # React application entry point
│   └── package.json
│
├── docker-compose.yml          # Container orchestration configuration
└── package.json                # Root workspace scripts
```

---

## License

MIT
