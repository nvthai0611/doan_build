import { PrismaService } from 'src/db/prisma.service';
export declare class ProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStudentProfileByStudentId(studentId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        isActive: boolean;
        studentId: string;
        studentCode: string;
        dateOfBirth: string;
        gender: "male" | "female" | "other" | undefined;
        address: string;
        grade: string;
        school: {
            id: string;
            name: string;
            address: any;
            phone: any;
        } | {
            id: string;
            name: string;
            address?: undefined;
            phone?: undefined;
        };
        enrollments: {
            id: bigint;
            classId: string;
            status: string;
            enrolledAt: string;
            class: {
                id: string;
                name: string;
                subject: string;
            };
        }[];
        parentLinks: {
            id: string;
            parentId: string;
            relation: any;
            primaryContact: boolean;
            parent: {
                id: string;
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                };
            };
        }[];
    }>;
}
