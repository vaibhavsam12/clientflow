# CLIENTFLOW — System Architecture & Engineering Design

## 1. Overview
CLIENTFLOW is an enterprise-grade B2B Client and Project Operations SaaS platform. It coordinates multi-client engagements, project lifecycle pipelines, task distribution workflows, document asset management, organization audit logging, and team velocity analytics.

---

## 2. High-Level System Architecture

```mermaid
graph TB
  subgraph Client ["Client Browser (SPA)"]
    UI["React 18 + TypeScript"]
    Rtr["React Router v6"]
    TQ["TanStack Query (Cache & State)"]
    RHF["React Hook Form + Zod"]
    Ax["Axios Instance (Auth Interceptor & Token Queue)"]
    UI --> Rtr
    UI --> TQ
    UI --> RHF
    TQ --> Ax
  end

  subgraph Gateway ["Reverse Proxy / Gateway"]
    Nginx["Nginx (Port 80 / Reverse Proxy)"]
  end

  subgraph API ["Backend Layer (Node.js / Express / TypeScript)"]
    App["Express App"]
    AuthMw["Auth & RBAC Guards"]
    ValMw["Zod Validation Middleware"]
    Ctrl["Controllers Layer"]
    Svc["Services Business Logic"]
    Storage["Storage Service Abstraction (Local / S3)"]
    Prisma["Prisma ORM Client"]
    Err["Centralized AppError Handler"]

    App --> AuthMw --> ValMw --> Ctrl --> Svc
    Svc --> Prisma
    Svc --> Storage
    Ctrl -.-> Err
    Svc -.-> Err
  end

  subgraph Persistence ["Persistence Layer"]
    DB[("PostgreSQL 16 Engine")]
    Disk[("Local Storage / S3 Bucket")]
  end

  Ax -->|HTTP / REST + JWT| Nginx
  Nginx -->|Proxy /api| App
  Prisma --> DB
  Storage --> Disk
```

---

## 3. Database Schema Design (Entity-Relationship)

```mermaid
erDiagram
  User ||--o{ RefreshToken : manages
  User ||--o{ ProjectMember : belongs_to
  User ||--o{ Task : assigned_to
  User ||--o{ Task : creates
  User ||--o{ Document : uploads
  User ||--o{ Notification : receives
  User ||--o{ ActivityLog : acts

  Client ||--o{ ClientContact : has
  Client ||--o{ Project : owns
  Client ||--o{ Document : holds
  Client ||--o{ ActivityLog : references

  Project ||--o{ ProjectMember : consists_of
  Project ||--o{ Task : contains
  Project ||--o{ Document : attaches
  Project ||--o{ ActivityLog : references

  Task ||--o{ ActivityLog : traces
```

### Relational Entities:
- **`User`**: Core identity model with unique email, bcrypt hash, role (`ADMIN`, `MANAGER`, `MEMBER`), and avatar url.
- **`RefreshToken`**: Session tracking table with UUID token hashes, expiration timestamps, and revocation timestamps enabling single-device logout or full-session revocation.
- **`Client`**: Enterprise client account with status (`LEAD`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), notes, company, and contact metadata.
- **`ClientContact`**: Specific stakeholders per client account, designated with primary flags, title, email, and phone.
- **`Project`**: Engagements linked to a client with status (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), target deadlines, and budgets.
- **`ProjectMember`**: Join relation establishing team members and assignment roles (`LEAD`, `CONTRIBUTOR`, `OBSERVER`) on specific projects.
- **`Task`**: Granular deliverables categorized across statuses (`TODO`, `IN_PROGRESS`, `BLOCKED`, `IN_REVIEW`, `DONE`), priority, assignee, creator, estimated hours, and completion dates.
- **`Document`**: File assets linked to projects/clients with storage key abstraction, MIME validation, and file size checks.
- **`Notification`**: Real-time user alert records with unread count tracking.
- **`ActivityLog`**: Immutable audit records capturing actor, action, entity type, ID, and serialized JSON metadata.

---

## 4. Security & Authentication Architecture

1. **JWT Dual-Token Rotation**:
   - Short-lived Access Token (15m validity): Passed in `Authorization: Bearer <token>` header containing `{ userId, email, role }`.
   - Long-lived Refresh Token (7d validity): Stored in database `RefreshToken` table and transmitted via secure HTTP-only cookies or body payload.
   - Axios request queue: Pending concurrent requests are buffered during refresh execution to prevent race conditions or duplicate refresh bursts.

2. **Role-Based Access Control (RBAC)**:
   - `ADMIN`: Unrestricted organizational permissions (User creation, status overrides, client archiving, root analytics).
   - `MANAGER`: Project creation, client management, team member assignments, task assignment, and document upload.
   - `MEMBER`: Task status execution, Kanban workflows, permitted project inspection, document uploads.

3. **Security Defenses**:
   - `Helmet`: HTTP security headers (XSS filtering, frameguard, CSP policies).
   - `CORS`: Origin whitelisting with credential support.
   - `Zod Validation`: Strict input sanitization preventing injection attacks.

---

## 5. Storage Abstraction Layer

- Interface `IStorageService` decouples storage implementation from business controllers.
- `LocalStorageService`: Writes to local file system disk with UUID-based filenames to prevent path traversal attacks.
- Direct pathway to configure AWS S3 / MinIO via `S3StorageService` without modifying application route logic.
