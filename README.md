# ClientFlow

**ClientFlow** is a client and project management platform built for software teams, digital agencies, and consultancies. It helps you manage clients, track project delivery, assign tasks with a Kanban board, store project documents, and view organization activity—all in one place.

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query), Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Zod
- **Database:** PostgreSQL
- **Auth:** JWT (Access + Rotating Refresh Tokens), Bcrypt, Role-Based Access Control (Admin, Manager, Member)
- **DevOps:** Docker, Docker Compose, Nginx

---

## ✨ Features

- **Dashboard:** Overview of active clients, projects in progress, overdue tasks, and recent team activity.
- **Client Management:** Store client info, manage key stakeholder contacts, and track notes.
- **Project Tracking:** Set budgets, target deadlines, track progress percentages, and assign team members.
- **Tasks & Kanban Board:** Switch between a table view and an interactive Kanban board (*To Do*, *In Progress*, *Blocked*, *In Review*, *Done*).
- **Document Vault:** Upload and download project specs, architectural assets, and client contracts.
- **Role Permissions (RBAC):**
  - **Admin:** Full control over users, clients, projects, and settings.
  - **Manager:** Manage clients, projects, team rosters, and task backlogs.
  - **Member:** Update assigned tasks, change Kanban status, and upload documents.
- **Activity Log & Notifications:** In-app alerts and an audit trail tracking what changed, who changed it, and when.

---

## 🚀 Getting Started

### Option 1: Run with Docker (Easiest)

Make sure you have Docker installed, then run:

```bash
docker-compose up --build
```

- **Frontend app:** http://localhost
- **Backend API:** http://localhost:5000/api/health

---

### Option 2: Run Locally (Development Mode)

#### 1. Start the Backend

```bash
cd backend
npm install
cp .env.example .env

# Set up the database and seed demo data
npx prisma db push
npm run prisma:seed

# Start the API server
npm run dev
```
The API will run on `http://localhost:5000`.

#### 2. Start the Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The UI will open on `http://localhost:5173`.

---

## 🔑 Demo Accounts

The database comes pre-seeded with sample data and test users for each role:

| Role | Email | Password | What you can test |
|---|---|---|---|
| **Admin** | `alex.admin@clientflow.io` | `Password123!` | Full access, user directory, archiving |
| **Manager** | `sarah.manager@clientflow.io` | `Password123!` | Create clients, projects, assign team members |
| **Member** | `david.engineer@clientflow.io` | `Password123!` | Task updates, Kanban board, file uploads |

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test
```
Runs 24 automated tests covering authentication, token refresh rotation, RBAC permission checks, and CRUD operations.

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📁 Project Structure

```text
clientflow/
├── backend/
│   ├── prisma/             # Database schema and seed script
│   ├── src/
│   │   ├── controllers/    # API endpoint controllers
│   │   ├── middleware/     # Auth, RBAC, and error handlers
│   │   ├── routes/         # Express routes
│   │   ├── schemas/        # Zod input validation
│   │   ├── services/       # Core business logic
│   │   └── server.ts       # Backend entrypoint
│   └── tests/              # Backend integration tests
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components, modals, Kanban board
│   │   ├── context/        # Auth and Toast contexts
│   │   ├── pages/          # Dashboard, Clients, Projects, Tasks, etc.
│   │   └── services/       # Axios API client and refresh logic
│   └── index.html          # Frontend entrypoint
│
└── docker-compose.yml      # Local multi-container setup
```

---

## 📄 License

MIT License.
