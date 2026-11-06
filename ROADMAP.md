# SkillSwap — Implementation Roadmap & Execution Blueprint

A peer-to-peer student skill exchange and matching platform restricted to college students and administrators.

---

## 🛠️ The Decided Technology Stack

- **Monorepo & Tooling:** `pnpm` Workspaces
- **Frontend (`frontend/`):**
  - Vite (SWC) + React 18/19
  - TypeScript
  - Tailwind CSS
  - Icons: `lucide-react`
  - Routing: `react-router-dom`
- **Backend (`backend/`):**
  - Node.js + Fastify (v4/v5)
  - TypeScript
  - ORM: Prisma
  - Database: Local PostgreSQL (`localhost:5432`)
  - Authentication: JWT (`@fastify/jwt`) + password hashing (`bcryptjs`)
  - CORS: `@fastify/cors`

---

## 🚀 Phased Implementation Plan

### 📍 Phase 1: Workspace Scaffolding, Database & Auth Gatekeeper
**Goal:** Root `pnpm` monorepo setup, Fastify server connected to local PostgreSQL via Prisma, and college-restricted authentication.

- **Tasks:**
  - Setup root `pnpm-workspace.yaml` (`frontend`, `backend`).
  - Initialize backend: Fastify, TypeScript, `@fastify/cors`, `@fastify/jwt`, Prisma.
  - Prisma Schema: Initial `User` model (`id`, `name`, `email`, `password`, `department`, `semester`, `rollNumber`, `role`, `createdAt`).
  - Run initial migration on local PostgreSQL.
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
  - Enforce college domain & roll number validation during registration.
  - Initialize frontend: Vite (SWC) + React + TS + Tailwind CSS + Lucide icons.
  - Setup `react-router-dom` with Auth Context, Login page, Register page, and protected route wrapper.
- **Verification Gate (100% Working Check):**
  - [x] Can register a student with college email and roll number.
  - [x] Invalid email domains are blocked with an error message.
  - [x] Login returns JWT; session persists on page refresh via `GET /api/auth/me`.
  - [x] Protected route redirects unauthenticated users to `/login`.

---

### 📍 Phase 2: Student Profile & Skill Catalog
**Goal:** Allow students to manage bio, academic details, skills they can teach, and skills they want to learn.

- **Tasks:**
  - Prisma Models: `Skill`, `OfferedSkill` (with proficiency level), `WantedSkill` (with priority level).
  - Seed initial master skills catalog (Programming, Design, Tools, etc.).
  - Backend Endpoints:
    - `GET /api/skills`
    - `GET /api/profile/me` & `PUT /api/profile/me`
    - `POST /api/profile/skills/offered` & `DELETE /api/profile/skills/offered/:id`
    - `POST /api/profile/skills/wanted` & `DELETE /api/profile/skills/wanted/:id`
  - Frontend: Profile Page with details card, skill selector dropdown/search, badges with remove triggers.
- **Verification Gate (100% Working Check):**
  - [x] Student can update profile bio, department, and semester.
  - [x] Student can add and remove offered and wanted skills.
  - [x] Data persists in PostgreSQL across refreshes.

---

### 📍 Phase 3: Discover Directory & Smart Matching Engine
**Goal:** Browse student directory and calculate mutual skill compatibility score.

- **Tasks:**
  - Backend: `/api/students/discover` endpoint with query filters (by skill, department, semester).
  - Smart Matching Algorithm:
    - Mutual Match (A teaches what B wants & B teaches what A wants): +50%
    - One-way Match: +25%
    - Same Department / Semester bonus: +10% / +5%
  - Frontend: Discover page with search bar, filter pills, student cards with "X% Match" compatibility badge and breakdown modal.
- **Verification Gate (100% Working Check):**
  - [x] Search by skill filters students accurately.
  - [x] Students with mutual skills show high match score (>80%).
  - [x] Clicking a card opens their full public profile.

---

### 📍 Phase 4: Skill Exchange Requests (The Transaction Flow)
**Goal:** Propose skill exchanges, manage incoming/outgoing requests, accept/reject.

- **Tasks:**
  - Prisma Model: `ExchangeRequest` (`id`, `senderId`, `receiverId`, `offeredSkillId`, `wantedSkillId`, `message`, `status`).
  - Backend Endpoints:
    - `POST /api/exchanges`
    - `GET /api/exchanges/incoming` & `GET /api/exchanges/sent`
    - `PATCH /api/exchanges/:id/status` (Accept / Reject / Cancel)
  - Frontend: "Send Exchange Request" modal, Requests page with Incoming/Sent tabs, status badges, contact email unlocked on accept.
- **Verification Gate (100% Working Check):**
  - [x] Student A sends request to Student B.
  - [x] Student B sees request under "Incoming" and clicks "Accept".
  - [x] Student A sees status updated to "Accepted" under "Sent" and sees contact info.

---

### 📍 Phase 5: College Admin Dashboard
**Goal:** Administrative oversight, metrics, and user/skill moderation.

- **Tasks:**
  - Admin authorization middleware (`role === 'ADMIN'`).
  - Backend Endpoints:
    - `GET /api/admin/stats` (counts of students, skills, exchanges, pending)
    - `GET /api/admin/students` (roster list)
    - `PATCH /api/admin/students/:id/status` (activate/suspend)
    - `POST /api/admin/skills` (add new system-wide skills)
  - Frontend: `/admin` dashboard with metrics cards, student table, moderation actions.
- **Verification Gate (100% Working Check):**
  - [x] Non-admin students receive `403 Forbidden` on admin routes.
  - [x] Admin can view live stats, search the student roster, activate/suspend accounts, and add system-wide skills.

---

### 📍 Phase 6: Seed Data, System-Wide Integration & Viva Script
**Goal:** 15–20 realistic mock student profiles, UI polish, and smooth viva presentation flow.

- **Tasks:**
  - [x] Seed script populates 16 realistic profiles across departments with diverse skills.
  - [x] UI polish includes action toasts, loading skeletons, and empty/error states.
  - [x] Five-minute presentation demo script is documented in `VIVA_DEMO.md`.
- **Verification Gate (100% Working Check):**
  - [ ] Complete end-to-end user flow runs cleanly on localhost without console errors (manual run-through not performed in this implementation pass).
