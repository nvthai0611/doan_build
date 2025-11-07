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
                createdAt: Date;
                id: string;
                updatedAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
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
                createdAt: Date;
                id: string;
                updatedAt: Date;
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
                createdAt: Date;
                id: string;
                updatedAt: Date;
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
    }>;
    getDetailPaymentOfParent(paymentId: string, parentId: string): Promise<{
        feeRecordPayments: ({
            feeRecord: {
                class: {
                    classCode: string;
                    name: string;
                };
                feeStructure: {
                    name: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    grade: string | null;
                    userId: string;
                    schoolId: string;
                    studentCode: string | null;
                    address: string | null;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                feeStructureId: string;
                status: string;
                studentId: string;
                classId: string | null;
                notes: string | null;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            createdAt: Date | null;
            id: string;
            updatedAt: Date | null;
            notes: string | null;
            paymentId: string | null;
            feeRecordId: string | null;
        })[];
    } & {
        createdAt: Date | null;
        id: string;
        status: string;
        updatedAt: Date | null;
        notes: string | null;
        parentId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal | null;
        returnMoney: import("@prisma/client/runtime/library").Decimal | null;
        method: import(".prisma/client").$Enums.PaymentMethod | null;
        expirationDate: Date | null;
        reference: string | null;
        paidAt: Date | null;
        transactionCode: string | null;
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
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                relationshipType: string | null;
            };
            feeRecordPayments: ({
                feeRecord: {
                    class: {
                        classCode: string;
                        name: string;
                    };
                    feeStructure: {
                        createdAt: Date;
                        id: string;
                        description: string | null;
                        gradeId: string | null;
                        name: string;
                        subjectId: string | null;
                        isActive: boolean;
                        amount: import("@prisma/client/runtime/library").Decimal;
                        period: string;
                    };
                    student: {
                        user: {
                            fullName: string;
                        };
                    } & {
                        createdAt: Date;
                        id: string;
                        updatedAt: Date;
                        grade: string | null;
                        userId: string;
                        schoolId: string;
                        studentCode: string | null;
                        address: string | null;
                        parentId: string | null;
                        scholarshipId: string | null;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    feeStructureId: string;
                    status: string;
                    studentId: string;
                    classId: string | null;
                    notes: string | null;
                    scholarship: import("@prisma/client/runtime/library").Decimal | null;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    dueDate: Date;
                    totalAmount: import("@prisma/client/runtime/library").Decimal | null;
                };
            } & {
                createdAt: Date | null;
                id: string;
                updatedAt: Date | null;
                notes: string | null;
                paymentId: string | null;
                feeRecordId: string | null;
            })[];
        } & {
            createdAt: Date | null;
            id: string;
            status: string;
            updatedAt: Date | null;
            notes: string | null;
            parentId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
        };
    }>;
    updatePaymentStatus(paymentId: string, body: {
        status: string;
        notes?: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            createdAt: Date | null;
            id: string;
            status: string;
            updatedAt: Date | null;
            notes: string | null;
            parentId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal | null;
            returnMoney: import("@prisma/client/runtime/library").Decimal | null;
            method: import(".prisma/client").$Enums.PaymentMethod | null;
            expirationDate: Date | null;
            reference: string | null;
            paidAt: Date | null;
            transactionCode: string | null;
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
                feeStructure: {
                    createdAt: Date;
                    id: string;
                    description: string | null;
                    gradeId: string | null;
                    name: string;
                    subjectId: string | null;
                    isActive: boolean;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    period: string;
                };
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    grade: string | null;
                    userId: string;
                    schoolId: string;
                    studentCode: string | null;
                    address: string | null;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                feeStructureId: string;
                status: string;
                studentId: string;
                classId: string | null;
                notes: string | null;
                scholarship: import("@prisma/client/runtime/library").Decimal | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            })[];
            user: {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                username: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
            };
            students: ({
                enrollments: ({
                    class: {
                        subject: {
                            id: string;
                            description: string | null;
                            name: string;
                            code: string;
                        };
                    } & {
                        createdAt: Date;
                        id: string;
                        roomId: string | null;
                        teacherId: string | null;
                        classCode: string | null;
                        description: string | null;
                        feeStructureId: string | null;
                        gradeId: string | null;
                        maxStudents: number | null;
                        name: string;
                        status: string;
                        subjectId: string;
                        recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                        academicYear: string | null;
                        expectedStartDate: Date | null;
                        actualStartDate: Date | null;
                        actualEndDate: Date | null;
                        updatedAt: Date;
                        feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                        feePeriod: string | null;
                        feeCurrency: string | null;
                        feeLockedAt: Date | null;
                        password: string | null;
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
                school: {
                    id: string;
                    name: string;
                    address: string;
                };
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    isActive: boolean;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                grade: string | null;
                userId: string;
                schoolId: string;
                studentCode: string | null;
                address: string | null;
                parentId: string | null;
                scholarshipId: string | null;
            })[];
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
            relationshipType: string | null;
        };
    }>;
    toggleParentStatus(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            user: {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
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
                createdAt: Date;
                id: string;
                updatedAt: Date;
                grade: string | null;
                userId: string;
                schoolId: string;
                studentCode: string | null;
                address: string | null;
                parentId: string | null;
                scholarshipId: string | null;
            })[];
        } & {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
            relationshipType: string | null;
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
                createdAt: Date;
                id: string;
                updatedAt: Date;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
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
    }>;
    unlinkStudentFromParent(parentId: string, studentId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
}
