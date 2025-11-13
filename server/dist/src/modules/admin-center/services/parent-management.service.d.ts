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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                id: string;
                isActive: boolean;
                avatar: string;
            };
            students: {
                id: string;
                studentCode: string;
                grade: string;
                address: string;
                user: {
                    password: string;
                    fullName: string;
                    username: string;
                    email: string;
                    phone: string;
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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    fullName: string;
                    email: string;
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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    fullName: string;
                    email: string;
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
                    createdAt: Date;
                    grade: string | null;
                    id: string;
                    parentId: string | null;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    scholarshipId: string | null;
                };
                feeStructure: {
                    name: string;
                    description: string | null;
                    gradeId: string | null;
                    subjectId: string | null;
                    createdAt: Date;
                    id: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    isActive: boolean;
                    period: string;
                };
            } & {
                status: string;
                feeStructureId: string;
                createdAt: Date;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                studentId: string;
                classId: string | null;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            })[];
            user: {
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
            };
            students: ({
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    isActive: boolean;
                    avatar: string;
                };
                school: {
                    name: string;
                    id: string;
                    address: string;
                };
                enrollments: ({
                    class: {
                        subject: {
                            name: string;
                            description: string | null;
                            id: string;
                            code: string;
                        };
                    } & {
                        name: string;
                        description: string | null;
                        password: string | null;
                        status: string;
                        gradeId: string | null;
                        subjectId: string;
                        roomId: string | null;
                        teacherId: string | null;
                        feeStructureId: string | null;
                        createdAt: Date;
                        academicYear: string | null;
                        id: string;
                        updatedAt: Date;
                        classCode: string | null;
                        maxStudents: number | null;
                        recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                        expectedStartDate: Date | null;
                        actualStartDate: Date | null;
                        actualEndDate: Date | null;
                        feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                        feePeriod: string | null;
                        feeCurrency: string | null;
                        feeLockedAt: Date | null;
                    };
                } & {
                    status: string;
                    id: bigint;
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
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            })[];
            relationshipType: string | null;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
            };
            students: ({
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            })[];
        } & {
            relationshipType: string | null;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
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
                fullName: string;
                username: string;
                email: string;
                phone: string;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                isActive: boolean;
                avatar: string;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
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
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                email: string;
                phone: string;
                birthDate: Date;
                id: string;
                isActive: boolean;
                avatar: string;
            };
            parent: {
                id: string;
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                };
            };
            school: {
                name: string;
                id: string;
            };
        };
        message: string;
    }>;
    linkStudentToParent(parentId: string, studentId: string): Promise<{
        data: {
            id: string;
            user: {
                fullName: string;
                gender: import(".prisma/client").$Enums.Gender;
                username: string;
                email: string;
                phone: string;
                birthDate: Date;
                id: string;
                isActive: boolean;
                avatar: string;
            };
            students: {
                id: string;
                studentCode: string;
                user: {
                    fullName: string;
                    email: string;
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
                    createdAt: Date;
                    grade: string | null;
                    id: string;
                    parentId: string | null;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
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
                status: string;
                feeStructureId: string;
                createdAt: Date;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                studentId: string;
                classId: string | null;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            createdAt: Date | null;
            id: string;
            updatedAt: Date | null;
            notes: string | null;
            feeRecordId: string | null;
            paymentId: string | null;
        })[];
    } & {
        status: string;
        createdAt: Date | null;
        id: string;
        parentId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal | null;
        returnMoney: import("@prisma/client/runtime/library").Decimal | null;
        updatedAt: Date | null;
        expirationDate: Date | null;
        reference: string | null;
        paidAt: Date | null;
        notes: string | null;
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
                    fullName: string;
                    email: string;
                };
            } & {
                relationshipType: string | null;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
            };
            feeRecordPayments: ({
                feeRecord: {
                    student: {
                        user: {
                            fullName: string;
                        };
                    } & {
                        createdAt: Date;
                        grade: string | null;
                        id: string;
                        parentId: string | null;
                        updatedAt: Date;
                        userId: string;
                        studentCode: string | null;
                        address: string | null;
                        schoolId: string;
                        scholarshipId: string | null;
                    };
                    class: {
                        name: string;
                        classCode: string;
                    };
                    feeStructure: {
                        name: string;
                        description: string | null;
                        gradeId: string | null;
                        subjectId: string | null;
                        createdAt: Date;
                        id: string;
                        amount: import("@prisma/client/runtime/library").Decimal;
                        isActive: boolean;
                        period: string;
                    };
                } & {
                    status: string;
                    feeStructureId: string;
                    createdAt: Date;
                    scholarship: import("@prisma/client/runtime/library").Decimal | null;
                    id: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    notes: string | null;
                    studentId: string;
                    classId: string | null;
                    dueDate: Date;
                    totalAmount: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                createdAt: Date | null;
                id: string;
                updatedAt: Date | null;
                notes: string | null;
                feeRecordId: string | null;
                paymentId: string | null;
            })[];
        } & {
            status: string;
            createdAt: Date | null;
            id: string;
            parentId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            updatedAt: Date | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            notes: string | null;
            transactionCode: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
        };
        message: string;
    }>;
    updateStatusPayment(paymentId: string, status: string, customNotes?: string): Promise<{
        data: {
            status: string;
            createdAt: Date | null;
            id: string;
            parentId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            updatedAt: Date | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            notes: string | null;
            transactionCode: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
        };
        message: string;
    }>;
}
