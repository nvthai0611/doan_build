import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";


@Injectable()
export class GradeService {
    constructor(private readonly prisma: PrismaService) {

    }
    async findAll() {
        try {
            const grades = await this.prisma.grade.findMany({
                orderBy: {
                    level: 'asc'
                }
            });
            return grades;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
   
}