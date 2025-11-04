import { PrismaService } from "../../../db/prisma.service";
export declare class StudentSharedService {
    private prisma;
    constructor(prisma: PrismaService);
    getStudentDetail(studentId: string, currentUser: any): Promise<any>;
    private getRoleBasedInclude;
    private checkViewPermission;
    private filterDataByRole;
    private getCurrentTeacherId;
    private getCurrentParentId;
}
