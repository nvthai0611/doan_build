import { HttpStatus } from '@nestjs/common';
import { ParentManagementService } from '../services/parent-management.service';
export declare class ParentManagementController {
    private readonly parentManagementService;
    constructor(parentManagementService: ParentManagementService);
    createParentWithStudents(body: {
        username: string;
        password: string;
        email: string;
        fullName: string;
        phone?: string;
        relationshipType: 'FATHER' | 'MOTHER' | 'OTHER';
        students?: Array<{
            fullName: string;
            gender: 'MALE' | 'FEMALE' | 'OTHER';
            birthDate: string;
            schoolId: string;
        }>;
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        message: string;
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
        meta: {};
    }>;
    createParent(body: {
        username: string;
        password: string;
        email: string;
        fullName: string;
        phone?: string;
        gender?: string;
        birthDate?: string;
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        message: string;
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
        meta: {};
    }>;
    addStudentToParent(parentId: string, body: {
        fullName: string;
        gender: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate: string;
        schoolId: string;
        password?: string;
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        message: string;
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
        meta: {};
    }>;
    getAllParents(page?: number, limit?: number, search?: string, isActive?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    getCountByStatus(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            total: number;
            active: number;
            inactive: number;
        };
    }>;
    findStudentByCode(studentCode: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    getDetailPaymentOfParent(paymentId: string, parentId: string): Promise<{
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
    createBillForParent(parentId: string, body: {
        feeRecordIds: string[];
        expirationDate?: string;
        notes?: string;
        reference?: string;
        method?: 'bank_transfer' | 'cash';
        payNow?: boolean;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    updatePaymentStatus(paymentId: string, body: {
        status: string;
        notes?: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    getParentById(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    toggleParentStatus(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    updateParent(id: string, body: {
        fullName?: string;
        email?: string;
        phone?: string;
        relationshipType?: 'FATHER' | 'MOTHER' | 'OTHER';
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        message: string;
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
        meta: {};
    }>;
    linkStudentToParent(parentId: string, body: {
        studentId: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    unlinkStudentFromParent(parentId: string, studentId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
}
