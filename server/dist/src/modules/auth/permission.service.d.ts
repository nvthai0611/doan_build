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
export declare class PermissionService {
    private prisma;
    constructor(prisma: PrismaService);
    getRolePermissions(roleName: string): Promise<Permission[]>;
    getUserPermissions(userId: string): Promise<Permission[]>;
    hasPermission(userId: string, permissionName: string): Promise<boolean>;
    hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean>;
    hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean>;
    getAllRoles(): Promise<Role[]>;
    getAllPermissions(): Promise<Permission[]>;
    assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void>;
    createPermission(data: {
        name: string;
        displayName: string;
        description?: string;
        module: string;
        action: string;
    }): Promise<Permission>;
    createRole(data: {
        name: string;
        displayName: string;
        description?: string;
    }): Promise<Role>;
}
