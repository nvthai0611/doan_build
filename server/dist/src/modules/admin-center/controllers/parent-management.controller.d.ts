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
        gender?: string;
        birthDate?: string;
        students?: Array<{
            fullName: string;
            username: string;
            email?: string;
            phone?: string;
            gender?: string;
            birthDate?: string;
            address?: string;
            grade?: string;
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
        meta: {};
    }>;
    addStudentToParent(parentId: string, body: {
        fullName: string;
        username: string;
        email?: string;
        phone?: string;
        gender?: string;
        birthDate?: string;
        address?: string;
        grade?: string;
        schoolId: string;
        password?: string;
    }): Promise<{
        success: boolean;
        status: HttpStatus;
        message: string;
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
    }>;
    getDetailPaymentOfParent(paymentId: string, parentId: string): Promise<{
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
    }>;
    updatePaymentStatus(paymentId: string, status: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    toggleParentStatus(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    updateParent(id: string, body: {
        email?: string;
        fullName?: string;
        phone?: string;
        gender?: string;
        birthDate?: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    linkStudentToParent(parentId: string, body: {
        studentId: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    unlinkStudentFromParent(parentId: string, studentId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
}
