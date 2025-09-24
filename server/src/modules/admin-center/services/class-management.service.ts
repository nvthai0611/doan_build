import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    // ...existing code...
}
