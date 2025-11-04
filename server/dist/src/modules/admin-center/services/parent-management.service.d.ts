import { PrismaService } from '../../../db/prisma.service';
export declare class ParentManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createParentWithStudents(createParentData: {
        fullName: string;
        username: string;
        email: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        password?: string;
        students?: Array<{
            fullName: string;
            username: string;
            email?: string;
            phone?: string;
            gender?: 'MALE' | 'FEMALE' | 'OTHER';
            birthDate?: string;
            address?: string;
            grade?: string;
            schoolId: string;
        }>;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                password: string;
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: any[];
            studentCount: number;
        };
        message: string;
    }>;
    addStudentToParent(parentId: string, studentData: {
        fullName: string;
        username: string;
        email?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        address?: string;
        grade?: string;
        schoolId: string;
        password?: string;
    }): Promise<{
        data: {
            id: string;
            user: {
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                grade: string;
                address: string;
                user: {
                    password: string;
                    email: string;
                    fullName: string;
                    phone: string;
                    username: string;
                    id: string;
                };
            }[];
            studentCount: number;
        };
        message: string;
    }>;
    createParent(createParentData: {
        fullName: string;
        username: string;
        email: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        password?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                password: string;
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            }[];
            studentCount: number;
        };
        message: string;
    }>;
    getAllParents(search?: string, gender?: string, accountStatus?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    email: string;
                    fullName: string;
                    id: string;
                };
            }[];
            studentCount: number;
        }[];
        meta: {
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
        message: string;
    }>;
    getParentById(parentId: string): Promise<{
        data: {
            payments: {
                id: string;
                amount: number;
                paidAmount: number;
                status: string;
                reference: string;
                paidAt: Date;
                notes: string;
                transactionCode: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                allocations: {
                    id: string;
                    feeRecordId: string;
                    notes: string;
                    studentId: string;
                    studentName: string;
                    className: string;
                    classCode: string;
                    feeName: string;
                }[];
            }[];
            studentCount: number;
            paymentStats: {
                totalPaid: number;
                totalPending: number;
                paymentCount: number;
            };
            pendingFees: ({
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
                    grade: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
                feeStructure: {
                    createdAt: Date;
                    isActive: boolean;
                    id: string;
                    name: string;
                    description: string | null;
                    subjectId: string | null;
                    gradeId: string | null;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
            } & {
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                createdAt: Date;
                id: string;
                status: string;
                feeStructureId: string;
                studentId: string;
                classId: string | null;
                notes: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            })[];
            user: {
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: ({
                user: {
                    email: string;
                    fullName: string;
                    isActive: boolean;
                    avatar: string;
                    phone: string;
                    id: string;
                };
                school: {
                    id: string;
                    name: string;
                    address: string;
                };
                enrollments: ({
                    class: {
                        subject: {
                            id: string;
                            name: string;
                            description: string | null;
                            code: string;
                        };
                    } & {
                        academicYear: string | null;
                        password: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        id: string;
                        name: string;
                        description: string | null;
                        subjectId: string;
                        gradeId: string | null;
                        maxStudents: number | null;
                        roomId: string | null;
                        teacherId: string | null;
                        status: string;
                        recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                        expectedStartDate: Date | null;
                        actualStartDate: Date | null;
                        actualEndDate: Date | null;
                        feeStructureId: string | null;
                        classCode: string | null;
                        feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                        feePeriod: string | null;
                        feeCurrency: string | null;
                        feeLockedAt: Date | null;
                    };
                } & {
                    id: bigint;
                    status: string;
                    studentId: string;
                    classId: string;
                    enrolledAt: Date;
                    semester: string | null;
                    completedAt: Date | null;
                    finalGrade: string | null;
                    completionStatus: string | null;
                    completionNotes: string | null;
                })[];
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            })[];
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            relationshipType: string | null;
        };
        message: string;
    }>;
    getCountByStatus(): Promise<{
        data: {
            total: number;
            active: number;
            inactive: number;
        };
        message: string;
    }>;
    toggleParentStatus(parentId: string): Promise<{
        data: {
            user: {
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: ({
                user: {
                    email: string;
                    fullName: string;
                    id: string;
                };
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            })[];
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            relationshipType: string | null;
        };
        message: string;
    }>;
    updateParent(parentId: string, updateParentData: {
        fullName?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            }[];
        };
        message: string;
    }>;
    findStudentByCode(studentCode: string): Promise<{
        data: {
            id: string;
            studentCode: string;
            grade: string;
            address: string;
            user: {
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            parent: {
                id: string;
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            };
            school: {
                id: string;
                name: string;
            };
        };
        message: string;
    }>;
    linkStudentToParent(parentId: string, studentId: string): Promise<{
        data: {
            id: string;
            user: {
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
                id: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            }[];
        };
        message: string;
    }>;
    unlinkStudentFromParent(parentId: string, studentId: string): Promise<{
        data: any;
        message: string;
    }>;
    getPaymentDetails(paymentId: string, parentId: string): Promise<{
        feeRecordPayments: ({
            feeRecord: {
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
                    grade: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
                class: {
                    name: string;
                    classCode: string;
                };
                feeStructure: {
                    name: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
            } & {
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                createdAt: Date;
                id: string;
                status: string;
                feeStructureId: string;
                studentId: string;
                classId: string | null;
                notes: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            createdAt: Date | null;
            updatedAt: Date | null;
            id: string;
            notes: string | null;
            paymentId: string | null;
            feeRecordId: string | null;
        })[];
    } & {
        createdAt: Date | null;
        updatedAt: Date | null;
        id: string;
        parentId: string | null;
        status: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal | null;
        returnMoney: import("@prisma/client/runtime/library").Decimal | null;
        expirationDate: Date | null;
        reference: string | null;
        paidAt: Date | null;
        transactionCode: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod | null;
    }>;
    createBillForParent(parentId: string, feeRecordIds: string[], options?: {
        expirationDate?: string;
        notes?: string;
        reference?: string;
        method?: 'bank_transfer' | 'cash';
        payNow?: boolean;
        cashGiven?: number;
    }): Promise<{
        data: {
            parent: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                relationshipType: string | null;
            };
            feeRecordPayments: ({
                feeRecord: {
                    student: {
                        user: {
                            fullName: string;
                        };
                    } & {
                        grade: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                        id: string;
                        userId: string;
                        studentCode: string | null;
                        address: string | null;
                        schoolId: string;
                        parentId: string | null;
                        scholarshipId: string | null;
                    };
                    class: {
                        name: string;
                        classCode: string;
                    };
                    feeStructure: {
                        createdAt: Date;
                        isActive: boolean;
                        id: string;
                        name: string;
                        description: string | null;
                        subjectId: string | null;
                        gradeId: string | null;
                        amount: import("@prisma/client/runtime/library").Decimal;
                        period: string;
                    };
                } & {
                    scholarship: import("@prisma/client/runtime/library").Decimal | null;
                    createdAt: Date;
                    id: string;
                    status: string;
                    feeStructureId: string;
                    studentId: string;
                    classId: string | null;
                    notes: string | null;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    dueDate: Date;
                    totalAmount: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                createdAt: Date | null;
                updatedAt: Date | null;
                id: string;
                notes: string | null;
                paymentId: string | null;
                feeRecordId: string | null;
            })[];
        } & {
            createdAt: Date | null;
            updatedAt: Date | null;
            id: string;
            parentId: string | null;
            status: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
        };
        message: string;
    }>;
    updateStatusPayment(paymentId: string, status: string): Promise<{
        data: {
            createdAt: Date | null;
            updatedAt: Date | null;
            id: string;
            parentId: string | null;
            status: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
        };
        message: string;
    }>;
}
