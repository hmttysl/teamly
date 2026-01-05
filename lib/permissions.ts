// Role-based permissions for Teamly

export type Role = "Owner" | "Lead" | "Teammate";

export interface RolePermissions {
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canMoveTasks: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canEditSpaceSettings: boolean;
  canArchiveSpace: boolean;
  canDeleteSpace: boolean;
  canLeaveSpace: boolean;
}

export const rolePermissions: Record<Role, RolePermissions> = {
  Owner: {
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canMoveTasks: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canEditSpaceSettings: true,
    canArchiveSpace: true,
    canDeleteSpace: true,
    canLeaveSpace: false,
  },
  Lead: {
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canMoveTasks: true,
    canInviteMembers: true,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditSpaceSettings: false,
    canArchiveSpace: false,
    canDeleteSpace: false,
    canLeaveSpace: true,
  },
  Teammate: {
    canCreateTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canAssignTasks: false,
    canMoveTasks: true,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canEditSpaceSettings: false,
    canArchiveSpace: false,
    canDeleteSpace: false,
    canLeaveSpace: true,
  },
};

export function hasPermission(role: Role, permission: keyof RolePermissions): boolean {
  return rolePermissions[role][permission];
}

export function canEditColumn(role: Role): boolean {
  return role === "Owner" || role === "Lead";
}

export function canManageTask(role: Role): boolean {
  return role === "Owner" || role === "Lead";
}
