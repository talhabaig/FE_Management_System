import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskCreatePage } from '../pages/TaskCreatePage';
import { TaskDetailPage } from '../pages/TaskDetailPage';
import { TasksPage } from '../pages/TasksPage';
import { TeamCreatePage } from '../pages/TeamCreatePage';
import { TeamDetailPage } from '../pages/TeamDetailPage';
import { TeamsPage } from '../pages/TeamsPage';
import { UserEditPage } from '../pages/UserEditPage';
import { UsersPage } from '../pages/UsersPage';
import { GuestOnly, RequireAuth, RequireRole, SessionGate } from './guards';

export const router = createBrowserRouter([
  {
    element: <SessionGate />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <DashboardPage /> },
              { path: '/tasks', element: <TasksPage /> },
              {
                element: <RequireRole roles={['ADMIN', 'MANAGER']} />,
                children: [{ path: '/tasks/new', element: <TaskCreatePage /> }],
              },
              { path: '/tasks/:taskId', element: <TaskDetailPage /> },
              { path: '/teams', element: <TeamsPage /> },
              {
                element: <RequireRole roles={['ADMIN']} />,
                children: [{ path: '/teams/new', element: <TeamCreatePage /> }],
              },
              { path: '/teams/:teamId', element: <TeamDetailPage /> },
              {
                element: <RequireRole roles={['ADMIN', 'MANAGER']} />,
                children: [{ path: '/users', element: <UsersPage /> }],
              },
              {
                element: <RequireRole roles={['ADMIN']} />,
                children: [{ path: '/users/:userId', element: <UserEditPage /> }],
              },
              { path: '/notifications', element: <NotificationsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
