import { PrismaService } from '../../../db/prisma.service';
export declare class ParentManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createParentWithStudents(createParentData: {
        fullName: string;
        username: string;
        email: string;
        phone?: string;
        relationshipType: 'FATHER' | 'MOTHER' | 'OTHER';
        password?: string;
        students?: Array<{
            fullName: string;
            gender: 'MALE' | 'FEMALE' | 'OTHER';
            birthDate: string;
            schoolId: string;
        }>;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                password: string;
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
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
                id: string;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
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
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
                    username: string;
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
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
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
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
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
                feeStructure: {
                    id: string;
                    createdAt: Date;
                    isActive: boolean;
                    name: string;
                    description: string | null;
                    gradeId: string | null;
                    subjectId: string | null;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
            } & {
                id: string;
                studentId: string;
                classId: string | null;
                status: string;
                createdAt: Date;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                feeStructureId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            })[];
            user: {
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: ({
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    isActive: boolean;
                    avatar: string;
                    phone: string;
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
                        id: string;
                        status: string;
                        createdAt: Date;
                        password: string | null;
                        updatedAt: Date;
                        name: string;
                        roomId: string | null;
                        teacherId: string | null;
                        classCode: string | null;
                        description: string | null;
                        feeStructureId: string | null;
                        gradeId: string | null;
                        maxStudents: number | null;
                        subjectId: string;
                        recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                        academicYear: string | null;
                        expectedStartDate: Date | null;
                        actualStartDate: Date | null;
                        actualEndDate: Date | null;
                        feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                        feePeriod: string | null;
                        feeCurrency: string | null;
                        feeLockedAt: Date | null;
                    };
                } & {
                    id: bigint;
                    studentId: string;
                    classId: string;
                    status: string;
                    enrolledAt: Date;
                    semester: string | null;
                    completedAt: Date | null;
                    finalGrade: string | null;
                    completionStatus: string | null;
                    completionNotes: string | null;
                })[];
                school: {
                    id: string;
                    name: string;
                    address: string;
                };
            } & {
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
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: ({
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                };
            } & {
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
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            relationshipType: string | null;
        };
        message: string;
    }>;
    updateParent(parentId: string, updateParentData: {
        fullName?: string;
        email?: string;
        phone?: string;
        relationshipType?: 'FATHER' | 'MOTHER' | 'OTHER';
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            relationshipType: string;
            user: {
                id: string;
                createdAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                updatedAt: Date;
                username: string;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
                };
            }[];
            studentCount: number;
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
                id: string;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            parent: {
                id: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
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
                id: string;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
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
                class: {
                    name: string;
                    classCode: string;
                };
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
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
                feeStructure: {
                    name: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
            } & {
                id: string;
                studentId: string;
                classId: string | null;
                status: string;
                createdAt: Date;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                feeStructureId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            notes: string | null;
            paymentId: string | null;
            feeRecordId: string | null;
        })[];
    } & {
        id: string;
        status: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        parentId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal | null;
        returnMoney: import("@prisma/client/runtime/library").Decimal | null;
        expirationDate: Date | null;
        reference: string | null;
        paidAt: Date | null;
        transactionCode: string | null;
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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                relationshipType: string | null;
            };
            feeRecordPayments: ({
                feeRecord: {
                    class: {
                        name: string;
                        classCode: string;
                    };
                    student: {
                        user: {
                            fullName: string;
                        };
                    } & {
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
                    feeStructure: {
                        id: string;
                        createdAt: Date;
                        isActive: boolean;
                        name: string;
                        description: string | null;
                        gradeId: string | null;
                        subjectId: string | null;
                        amount: import("@prisma/client/runtime/library").Decimal;
                        period: string;
                    };
                } & {
                    id: string;
                    studentId: string;
                    classId: string | null;
                    status: string;
                    createdAt: Date;
                    scholarship: import("@prisma/client/runtime/library").Decimal | null;
                    feeStructureId: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    notes: string | null;
                    dueDate: Date;
                    totalAmount: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                id: string;
                createdAt: Date | null;
                updatedAt: Date | null;
                notes: string | null;
                paymentId: string | null;
                feeRecordId: string | null;
            })[];
        } & {
            id: string;
            status: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            parentId: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
        };
        message: string;
    }>;
    updateStatusPayment(paymentId: string, status: string, customNotes?: string): Promise<{
        data: {
            id: string;
            status: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            parentId: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
        };
        message: string;
    }>;
}
