import { UsersService } from '../services/user-management.service';
import { QueryUserDto } from '../dto/user/query-user.dto';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ResetPasswordDto } from '../dto/user/reset-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: QueryUserDto): Promise<{
        data: {
            id: any;
            fullName: any;
            username: any;
            email: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            avatar: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            gender: any;
            birthDate: any;
            lastLoginAt: any;
            linkedEntities: {
                teacher: {
                    id: any;
                    teacherCode: any;
                    schoolName: any;
                };
                parent: {
                    id: any;
                    relationshipType: any;
                    studentsCount: any;
                    students: any;
                };
                student: {
                    id: any;
                    studentCode: any;
                    grade: any;
                    parent: {
                        id: any;
                        relationshipType: any;
                        fullName: any;
                    };
                };
            };
            permissionCount: any;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        summary: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            newUsersThisMonth: number;
        };
        filters: {
            roles: {
                label: string;
                value: "parent" | "teacher" | "center_owner" | "student" | "admin";
            }[];
            statuses: readonly ["all", "active", "inactive"];
            genders: ("MALE" | "FEMALE" | "OTHER")[];
        };
        message: string;
    }>;
    checkAvailability(email?: string, username?: string, excludeId?: string): Promise<{
        data: {
            emailAvailable: boolean;
            usernameAvailable: boolean;
            emailMessage?: string;
            usernameMessage?: string;
        };
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: {
            sessions: any;
            recentActivities: any;
            id: any;
            fullName: any;
            username: any;
            email: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            avatar: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            gender: any;
            birthDate: any;
            lastLoginAt: any;
            linkedEntities: {
                teacher: {
                    id: any;
                    teacherCode: any;
                    schoolName: any;
                };
                parent: {
                    id: any;
                    relationshipType: any;
                    studentsCount: any;
                    students: any;
                };
                student: {
                    id: any;
                    studentCode: any;
                    grade: any;
                    parent: {
                        id: any;
                        relationshipType: any;
                        fullName: any;
                    };
                };
            };
            permissionCount: any;
        };
        message: string;
    }>;
    create(body: CreateUserDto): Promise<{
        data: {
            id: any;
            fullName: any;
            username: any;
            email: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            avatar: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            gender: any;
            birthDate: any;
            lastLoginAt: any;
            linkedEntities: {
                teacher: {
                    id: any;
                    teacherCode: any;
                    schoolName: any;
                };
                parent: {
                    id: any;
                    relationshipType: any;
                    studentsCount: any;
                    students: any;
                };
                student: {
                    id: any;
                    studentCode: any;
                    grade: any;
                    parent: {
                        id: any;
                        relationshipType: any;
                        fullName: any;
                    };
                };
            };
            permissionCount: any;
        };
        message: string;
    }>;
    update(id: string, body: UpdateUserDto): Promise<{
        data: {
            id: any;
            fullName: any;
            username: any;
            email: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            avatar: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            gender: any;
            birthDate: any;
            lastLoginAt: any;
            linkedEntities: {
                teacher: {
                    id: any;
                    teacherCode: any;
                    schoolName: any;
                };
                parent: {
                    id: any;
                    relationshipType: any;
                    studentsCount: any;
                    students: any;
                };
                student: {
                    id: any;
                    studentCode: any;
                    grade: any;
                    parent: {
                        id: any;
                        relationshipType: any;
                        fullName: any;
                    };
                };
            };
            permissionCount: any;
        };
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        data: {
            id: any;
            fullName: any;
            username: any;
            email: any;
            phone: any;
            role: any;
            roleDisplayName: any;
            avatar: any;
            isActive: any;
            createdAt: any;
            updatedAt: any;
            gender: any;
            birthDate: any;
            lastLoginAt: any;
            linkedEntities: {
                teacher: {
                    id: any;
                    teacherCode: any;
                    schoolName: any;
                };
                parent: {
                    id: any;
                    relationshipType: any;
                    studentsCount: any;
                    students: any;
                };
                student: {
                    id: any;
                    studentCode: any;
                    grade: any;
                    parent: {
                        id: any;
                        relationshipType: any;
                        fullName: any;
                    };
                };
            };
            permissionCount: any;
        };
        message: string;
    }>;
    resetPassword(id: string, body: ResetPasswordDto): Promise<{
        data: {
            temporaryPassword?: string;
            id: string;
            username: string;
        };
        message: string;
    }>;
}
