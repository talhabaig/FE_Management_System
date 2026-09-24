import type { User } from '../types/api';

export function canViewUsers(role: User['role'] | undefined): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canEditUsers(role: User['role'] | undefined): boolean {
  return role === 'ADMIN';
}

export function canDeactivateUser(actor: User, targetId: string): boolean {
  return actor.role === 'ADMIN' && actor.id !== targetId;
}

export function canCreateTeam(role: User['role'] | undefined): boolean {
  return role === 'ADMIN';
}

export function canManageTeam(actor: User, team: { managerId: string }): boolean {
  if (actor.role === 'ADMIN') {
    return true;
  }
  return actor.role === 'MANAGER' && team.managerId === actor.id;
}

export function canDeleteTeam(role: User['role'] | undefined): boolean {
  return role === 'ADMIN';
}

export function canCreateTask(role: User['role'] | undefined): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canManageTask(actor: User, task: { team: { managerId: string } }): boolean {
  if (actor.role === 'ADMIN') {
    return true;
  }
  return actor.role === 'MANAGER' && task.team.managerId === actor.id;
}

export function canUpdateTaskStatus(
  actor: User,
  task: { assignedToId: string | null; team: { managerId: string } },
): boolean {
  if (canManageTask(actor, task)) {
    return true;
  }
  return task.assignedToId === actor.id;
}

export function canModifyComment(actor: User, comment: { userId: string }): boolean {
  return actor.role === 'ADMIN' || comment.userId === actor.id;
}
