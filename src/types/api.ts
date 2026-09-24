export type Role = 'ADMIN' | 'MANAGER' | 'USER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED';
export type TaskSortField = 'createdAt' | 'updatedAt' | 'deadline' | 'priority' | 'status' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  manager: UserSummary;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  createdAt: string;
  user: UserSummary;
}

export interface TaskTeam {
  id: string;
  name: string;
  managerId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  teamId: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  team: TaskTeam;
  createdBy: UserSummary;
  assignedTo: UserSummary | null;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  taskId: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
  overdue: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

export interface LoggedOutResult {
  loggedOut: boolean;
}

export interface MarkAllReadResult {
  updated: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UserListFilters extends PaginationParams {
  search?: string;
  role?: Role;
}

export interface TeamListFilters extends PaginationParams {
  search?: string;
}

export interface TaskListFilters extends PaginationParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string;
  assignedToId?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy: TaskSortField;
  sortOrder: SortOrder;
}

export interface DashboardFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string;
  assignedToId?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  teamId: string;
  assignedToId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string | null;
  teamId?: string;
  assignedToId?: string | null;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  managerId: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string | null;
  managerId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  isActive?: boolean;
}
