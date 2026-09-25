import { describe, expect, it } from 'vitest';
import { makeUser } from '../test/fixtures';
import {
  canCreateTask,
  canCreateTeam,
  canDeactivateUser,
  canDeleteTeam,
  canEditUsers,
  canManageTask,
  canManageTeam,
  canModifyComment,
  canUpdateTaskStatus,
  canViewUsers,
} from './permissions';

describe('permissions', () => {
  it('lets admins and managers view users, but not regular users', () => {
    // Arrange
    const admin = 'ADMIN' as const;
    const manager = 'MANAGER' as const;
    const user = 'USER' as const;

    // Act
    const adminCanView = canViewUsers(admin);
    const managerCanView = canViewUsers(manager);
    const userCanView = canViewUsers(user);
    const missingRole = canViewUsers(undefined);

    // Assert
    expect(adminCanView).toBe(true);
    expect(managerCanView).toBe(true);
    expect(userCanView).toBe(false);
    expect(missingRole).toBe(false);
  });

  it('lets only admins edit users', () => {
    // Arrange / Act / Assert
    expect(canEditUsers('ADMIN')).toBe(true);
    expect(canEditUsers('MANAGER')).toBe(false);
    expect(canEditUsers('USER')).toBe(false);
  });

  it('lets an admin deactivate another account, but not their own', () => {
    // Arrange
    const admin = makeUser({ id: 'admin-1', role: 'ADMIN' });

    // Act
    const canDeactivateOther = canDeactivateUser(admin, 'user-2');
    const canDeactivateSelf = canDeactivateUser(admin, 'admin-1');

    // Assert
    expect(canDeactivateOther).toBe(true);
    expect(canDeactivateSelf).toBe(false);
  });

  it('lets only admins create or delete teams', () => {
    // Arrange / Act / Assert
    expect(canCreateTeam('ADMIN')).toBe(true);
    expect(canCreateTeam('MANAGER')).toBe(false);
    expect(canDeleteTeam('ADMIN')).toBe(true);
    expect(canDeleteTeam('USER')).toBe(false);
  });

  it('lets a manager manage only their own team', () => {
    // Arrange
    const manager = makeUser({ id: 'mgr-1', role: 'MANAGER' });
    const admin = makeUser({ id: 'admin-1', role: 'ADMIN' });

    // Act
    const managerOwnTeam = canManageTeam(manager, { managerId: 'mgr-1' });
    const managerOtherTeam = canManageTeam(manager, { managerId: 'mgr-2' });
    const adminAnyTeam = canManageTeam(admin, { managerId: 'mgr-2' });

    // Assert
    expect(managerOwnTeam).toBe(true);
    expect(managerOtherTeam).toBe(false);
    expect(adminAnyTeam).toBe(true);
  });

  it('lets admins and managers create tasks', () => {
    // Arrange / Act / Assert
    expect(canCreateTask('ADMIN')).toBe(true);
    expect(canCreateTask('MANAGER')).toBe(true);
    expect(canCreateTask('USER')).toBe(false);
  });

  it('lets a manager manage tasks on their team only', () => {
    // Arrange
    const manager = makeUser({ id: 'mgr-1', role: 'MANAGER' });

    // Act
    const ownTeam = canManageTask(manager, { team: { managerId: 'mgr-1' } });
    const otherTeam = canManageTask(manager, { team: { managerId: 'mgr-2' } });

    // Assert
    expect(ownTeam).toBe(true);
    expect(otherTeam).toBe(false);
  });

  it('lets an assignee update status even when they cannot manage the task', () => {
    // Arrange
    const user = makeUser({ id: 'user-1', role: 'USER' });
    const assigned = { assignedToId: 'user-1', team: { managerId: 'mgr-1' } };
    const unassigned = { assignedToId: 'user-2', team: { managerId: 'mgr-1' } };

    // Act
    const assignedCanUpdate = canUpdateTaskStatus(user, assigned);
    const otherCannotUpdate = canUpdateTaskStatus(user, unassigned);

    // Assert
    expect(assignedCanUpdate).toBe(true);
    expect(otherCannotUpdate).toBe(false);
  });

  it('lets an author or admin modify a comment', () => {
    // Arrange
    const author = makeUser({ id: 'user-1', role: 'USER' });
    const admin = makeUser({ id: 'admin-1', role: 'ADMIN' });
    const other = makeUser({ id: 'user-2', role: 'USER' });

    // Act / Assert
    expect(canModifyComment(author, { userId: 'user-1' })).toBe(true);
    expect(canModifyComment(admin, { userId: 'user-1' })).toBe(true);
    expect(canModifyComment(other, { userId: 'user-1' })).toBe(false);
  });
});
