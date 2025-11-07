import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";

@Injectable()
export class PayRollTeacherService {
    constructor(private prisma: PrismaService){}

    async getListTeachers(
        teacherName: string, 
        email: string, 
        status: string,
        month?: string
    ) {
        const whereClause: any = {
            user: {
                isActive: true,
                ...(teacherName && {
                    fullName: {
                        contains: teacherName,
                        mode: 'insensitive'
                    }
                }),
                ...(email && {
                    email: {
                        contains: email,
                        mode: 'insensitive'
                    }
                })
            }
        }

        // Helper function để tính ngày bắt đầu và kết thúc tháng
        const getMonthRange = (monthString: string) => {
            const [year, monthNum] = monthString.split('-')
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
            const endDate = new Date(parseInt(year), parseInt(monthNum), 1)
            
            return { startDate, endDate }
        }

        // Build payroll filter conditions
        const payrollFilter: any = {}
        
        if (status) {
            payrollFilter.status = status
        }

        if (month) {
            const monthRange = getMonthRange(month)
            payrollFilter.AND = [
                {
                    periodStart: {
                        gte: monthRange.startDate
                    }
                },
                {
                    periodStart: {
                        lt: monthRange.endDate
                    }
                }
            ]
        }

        // Filter teachers that have matching payrolls
        if (Object.keys(payrollFilter).length > 0) {
            whereClause.payrolls = {
                some: payrollFilter
            }
        }

        return this.prisma.teacher.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                payrolls: {
                    ...(Object.keys(payrollFilter).length > 0 && {
                        where: payrollFilter
                    }),
                    orderBy: {
                        periodStart: 'desc'
                    }
                },
                payrollPayments: true
            }
        })
    }

    async getTeacherPayroll(){
        // TODO: Implement this method
    }
}