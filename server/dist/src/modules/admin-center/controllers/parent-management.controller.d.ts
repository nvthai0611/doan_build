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
    }>;
    updatePaymentStatus(paymentId: string, body: {
        status: string;
        notes?: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
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
    }>;
    toggleParentStatus(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
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
