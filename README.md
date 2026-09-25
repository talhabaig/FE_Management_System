# Task Management Frontend

React + Vite client for the role-based Task Management API. Covers auth, teams, tasks, comments, notifications, and the dashboard. Role checks follow the backend rules.

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
- A running API (local or deployed). See the backend `BE_Management_System` README.

## Setup

```bash
npm install
cp .env.example .env
```

Set the API proxy target in `.env` (used by Vite in development):

```env
VITE_API_URL=https://be-management-system.vercel.app
```

Or a local API:

```env
VITE_API_URL=http://localhost:3000
```

The browser always calls same-origin `/api`. Vite and Vercel proxy those requests to the backend so the refresh cookie stays first-party and survives a page reload.

## Scripts

```bash
npm run dev         # http://localhost:5173
npm run build       # typecheck + production bundle
npm run preview     # serve the build locally
npm test            # unit tests (AAA pattern, Vitest)
npm run test:watch  # re-run tests on change
```

## Auth

- Access token is kept in memory only (not `localStorage`).
- Refresh token is an `HttpOnly` cookie on `/api/auth`.
- Reloading the page restores the session with `POST /api/auth/refresh`.
- Register always creates an active `USER`. An admin changes roles later.

## Roles

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

Available after the backend seed. Password for all seed users: `Password123!`

| Role | Email |
| --- | --- |
| ADMIN | `admin@example.com` |
| MANAGER | `manager@example.com` |
| USER | `user1@example.com` |
| USER | `user2@example.com` |

Do not use this password in production.

## Demo checklist

1. Sign in as Admin (`admin@example.com`).
2. Open Dashboard. Click a summary card and check that Tasks opens with the same filters.
3. Create a Team, add a member, create a Task, assign it to `user1@example.com`.
4. Confirm the assignee gets a Notification.
5. Sign out, sign in as Manager. Update status or team membership on a managed team.
6. Sign out, sign in as User. Confirm only assigned tasks show. Add a comment and mark notifications read.
7. Reload the browser while signed in. Session should come back through the refresh cookie.

## Deploy (Vercel)

1. Import this repo in Vercel (Vite preset).
2. Leave `VITE_API_URL` **empty / unset** on Vercel. The app calls `/api` on the same origin; `vercel.json` proxies those requests to `https://be-management-system.vercel.app`.
3. On the backend, you can still list this frontend origin in `CORS_ORIGIN` if you call the API directly elsewhere.
4. Deploy and run the demo checklist against production.

`vercel.json` also rewrites non-API routes to `index.html` so paths like `/login` work on refresh.

### Why same-origin `/api`?

Access tokens are memory-only. After a refresh, the session comes back through the `refreshToken` HttpOnly cookie. If the UI and API are on different Vercel hosts, that cookie is third-party and browsers often drop it — so reload sends you to login. Proxying `/api` keeps the cookie first-party.

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
