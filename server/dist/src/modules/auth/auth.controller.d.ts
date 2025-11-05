import { LoginDto } from './dto/loginDto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterParentDto } from './dto/register-parent.dto';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
export declare class AuthController {
    private readonly authService;
    private readonly permissionService;
    constructor(authService: AuthService, permissionService: PermissionService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                username: string;
                email: string;
                avatar: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
                fullName: string;
                role: string;
                phone: string;
                isActive: boolean;
                student: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    grade: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
                parent: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    relationshipType: string | null;
                };
            };
        };
    }>;
    registerParent(registerDto: RegisterParentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            parent: {
                id: any;
                email: any;
                username: any;
                fullName: any;
                phone: any;
                birthDate: any;
                gender: any;
            };
            children: any;
        };
    }>;
    profile(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            phone: string;
            avatar: string;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            student: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            parent: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                relationshipType: string | null;
            };
            permissions: string[];
            roleData: {
                rolePermissions: ({
                    permission: {
                        id: string;
                        createdAt: Date;
                        isActive: boolean;
                        updatedAt: Date;
                        name: string;
                        description: string | null;
                        displayName: string;
                        module: string;
                        action: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    roleId: string;
                    permissionId: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                name: string;
                description: string | null;
                displayName: string;
            };
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    refresh(refreshToken: string): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                email: string;
                fullName: string;
                role: string;
                phone: string;
                isActive: boolean;
                student: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    grade: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
                parent: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    relationshipType: string | null;
                };
            };
        };
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            role: string;
            phone: string;
            avatar: string;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            isActive: boolean;
            student: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            parent: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                relationshipType: string | null;
            };
        };
    }>;
    getActiveSessions(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            expiresAt: Date;
        }[];
    }>;
    revokeSession(sessionId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserPermissions(req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./permission.service").Permission[];
    }>;
    checkPermission(permissionName: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            hasPermission: boolean;
            permissionName: string;
        };
    }>;
    getAllRoles(): Promise<{
        success: boolean;
        message: string;
        data: import("./permission.service").Role[];
    }>;
    getAllPermissions(): Promise<{
        success: boolean;
        message: string;
        data: import("./permission.service").Permission[];
    }>;
}
