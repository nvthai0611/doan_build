import { PrismaService } from 'src/db/prisma.service';
import { PermissionService } from './permission.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { AlertService } from '../admin-center/services/alert.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class AuthService {
    private readonly prisma;
    private readonly permissionService;
    private readonly alertService;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, permissionService: PermissionService, alertService: AlertService, cloudinaryService: CloudinaryService);
    getUserByField(field: string, value: string): Promise<{
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
        teacher: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
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
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        password: string;
        fullName: string | null;
        isActive: boolean;
        avatar: string | null;
        phone: string | null;
        role: string;
        roleId: string | null;
        updatedAt: Date;
        username: string;
        gender: import(".prisma/client").$Enums.Gender | null;
        birthDate: Date | null;
    }>;
    validateUser(identifier: string, password: string): Promise<{
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
        teacher: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
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
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        password: string;
        fullName: string | null;
        isActive: boolean;
        avatar: string | null;
        phone: string | null;
        role: string;
        roleId: string | null;
        updatedAt: Date;
        username: string;
        gender: import(".prisma/client").$Enums.Gender | null;
        birthDate: Date | null;
    }>;
    login(identifier: string, password: string): Promise<{
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
    refreshToken(refreshToken: string): Promise<{
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
    }>;
    logout(userId: string, refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(userId: string): Promise<{
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
    }>;
    updateProfile(userId: string, updateData: any): Promise<{
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
    }>;
    getActiveSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
