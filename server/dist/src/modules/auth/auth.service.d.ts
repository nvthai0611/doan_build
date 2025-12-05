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
        parent: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            relationshipType: string | null;
        };
        student: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        teacher: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        roleData: {
            rolePermissions: ({
                permission: {
                    createdAt: Date;
                    isActive: boolean;
                    updatedAt: Date;
                    id: string;
                    name: string;
                    displayName: string;
                    description: string | null;
                    module: string;
                    action: string;
                };
            } & {
                createdAt: Date;
                roleId: string;
                id: string;
                permissionId: string;
            })[];
        } & {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            name: string;
            displayName: string;
            description: string | null;
        };
    } & {
        email: string | null;
        role: string;
        password: string;
        createdAt: Date;
        fullName: string | null;
        isActive: boolean;
        avatar: string | null;
        phone: string | null;
        roleId: string | null;
        updatedAt: Date;
        username: string;
        id: string;
        gender: import(".prisma/client").$Enums.Gender | null;
        birthDate: Date | null;
    }>;
    validateUser(identifier: string, password: string): Promise<{
        parent: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            relationshipType: string | null;
        };
        student: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        teacher: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        roleData: {
            rolePermissions: ({
                permission: {
                    createdAt: Date;
                    isActive: boolean;
                    updatedAt: Date;
                    id: string;
                    name: string;
                    displayName: string;
                    description: string | null;
                    module: string;
                    action: string;
                };
            } & {
                createdAt: Date;
                roleId: string;
                id: string;
                permissionId: string;
            })[];
        } & {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            name: string;
            displayName: string;
            description: string | null;
        };
    } & {
        email: string | null;
        role: string;
        password: string;
        createdAt: Date;
        fullName: string | null;
        isActive: boolean;
        avatar: string | null;
        phone: string | null;
        roleId: string | null;
        updatedAt: Date;
        username: string;
        id: string;
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
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            parent: {
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                id: string;
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
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            parent: {
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                id: string;
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
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        parent: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            relationshipType: string | null;
        };
        permissions: string[];
        roleData: {
            rolePermissions: ({
                permission: {
                    createdAt: Date;
                    isActive: boolean;
                    updatedAt: Date;
                    id: string;
                    name: string;
                    displayName: string;
                    description: string | null;
                    module: string;
                    action: string;
                };
            } & {
                createdAt: Date;
                roleId: string;
                id: string;
                permissionId: string;
            })[];
        } & {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            name: string;
            displayName: string;
            description: string | null;
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
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        };
        parent: {
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            relationshipType: string | null;
        };
    }>;
    getActiveSessions(userId: string): Promise<{
        createdAt: Date;
        id: string;
        expiresAt: Date;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
