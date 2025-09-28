import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
}

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(roleName: string): Promise<Permission[]> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      return [];
    }

    return role.rolePermissions
      .filter(rp => rp.permission.isActive)
      .map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
        description: rp.permission.description,
        module: rp.permission.module,
        action: rp.permission.action,
        isActive: rp.permission.isActive
      }));
  }

  /**
   * Get all permissions for a user by their role
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleData: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.roleData) {
      return [];
    }

    return user.roleData.rolePermissions
      .filter(rp => rp.permission.isActive)
      .map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
        description: rp.permission.description,
        module: rp.permission.module,
        action: rp.permission.action,
        isActive: rp.permission.isActive
      }));
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(permission => permission.name === permissionName);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const userPermissionNames = permissions.map(p => p.name);
    return permissionNames.some(permissionName => userPermissionNames.includes(permissionName));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const userPermissionNames = permissions.map(p => p.name);
    return permissionNames.every(permissionName => userPermissionNames.includes(permissionName));
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      where: { isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      permissions: role.rolePermissions
        .filter(rp => rp.permission.isActive)
        .map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          displayName: rp.permission.displayName,
          description: rp.permission.description,
          module: rp.permission.module,
          action: rp.permission.action,
          isActive: rp.permission.isActive
        }))
    }));
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { isActive: true }
    });

    return permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description,
      module: permission.module,
      action: permission.action,
      isActive: permission.isActive
    }));
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId }
    });

    // Add new permissions
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId,
        permissionId
      }))
    });
  }

  /**
   * Create a new permission
   */
  async createPermission(data: {
    name: string;
    displayName: string;
    description?: string;
    module: string;
    action: string;
  }): Promise<Permission> {
    const permission = await this.prisma.permission.create({
      data
    });

    return {
      id: permission.id,
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description,
      module: permission.module,
      action: permission.action,
      isActive: permission.isActive
    };
  }

  /**
   * Create a new role
   */
  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
  }): Promise<Role> {
    const role = await this.prisma.role.create({
      data,
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      permissions: []
    };
  }
}
