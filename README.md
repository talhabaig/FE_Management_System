# Task Management Frontend

React + Vite UI for the role-based Task Management API. Users sign in, work in teams, manage tasks, leave comments, and receive assignment notifications. Permissions match the backend role matrix.

## Stack

- React 18 + TypeScript (strict)
- Vite 6
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios (`withCredentials` for refresh cookies)
- Tailwind CSS

## Requirements

- Node.js 20+
- npm
- Running API (local or deployed). See the backend `BE_Management_System` README.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

For the hosted API:

```env
VITE_API_URL=https://be-management-system.vercel.app
```

The backend `CORS_ORIGIN` must include this app’s origin (for example `http://localhost:5173` and your Vercel frontend URL). Production cookies use `Secure` + `SameSite=None`, so the API and UI both need HTTPS.

## Scripts

```bash
npm run dev       # http://localhost:5173
npm run build     # typecheck + production bundle
npm run preview   # serve the build locally
```

## Auth model (aligned with API docs)

- Short-lived access token stays in memory (not `localStorage`).
- Refresh token is an `HttpOnly` cookie on `/api/auth`.
- A full page reload restores the session via `POST /api/auth/refresh`.
- Registration always creates an active `USER`. Roles are changed by an administrator.

## Roles (from API docs)

| Action | ADMIN | MANAGER | USER |
| --- | --- | --- | --- |
| List users / change roles / deactivate | Yes (MANAGER: list only) | List users only | Own profile only |
| Create / delete teams | Yes | No | No |
| Update team + membership | Any team | Teams they manage | No |
| Create / update / assign / delete tasks | Any team | Teams they manage | No |
| View tasks | All | Managed teams + assigned | Assigned only |
| Update task status | Any visible task | Managed + assigned | Assigned only |
| Comment | Visible tasks | Visible tasks | Assigned tasks |
| Edit / delete another user’s comment | Yes | No | No |
| Notifications / dashboard | Own / all stats | Own / managed-team stats | Own / assigned stats |

## Demo credentials (seed)

Use only after the backend seed has run. Password for all seed users: `Password123!`

| Role | Email |
| --- | --- |
| ADMIN | `admin@example.com` |
| MANAGER | `manager@example.com` |
| USER | `user1@example.com` |
| USER | `user2@example.com` |

Do not use this password in production.

## Client demo checklist (~7 minutes)

1. **Admin** — sign in as `admin@example.com`.
2. Open **Dashboard**. Click a summary card (for example High priority or To do) and confirm it opens **Tasks** with matching filters.
3. Create a **Team**, add a member, create a **Task**, assign it to `user1@example.com`.
4. Confirm the assignee gets a **Notification**.
5. **Log out**, sign in as **Manager**. Update status / team membership on a managed team.
6. **Log out**, sign in as **User**. Confirm only assigned tasks appear; add a **comment**; mark notifications read.
7. **Reload the browser** while signed in — session should restore via the refresh cookie.

## Deploy (Vercel)

1. Import this repo in Vercel (Vite preset).
2. Set `VITE_API_URL` to the backend URL.
3. On the backend, add this frontend origin to `CORS_ORIGIN`.
4. Deploy and walk the checklist above against production.

## Project layout

```text
src/
  components/   UI, forms, layout
  hooks/        React Query hooks
  lib/          API client, permissions, paths, filters
  pages/        Route screens
  routes/       Router + auth guards
  schemas/      Zod form schemas
  types/        Shared API types
```
