import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
@Injectable()
export class AuthService {
  getUserByFiel(field: string = 'id', value: string) {
    return prisma.user.findFirst({
      where: {
        [field]: value,
      },
    });
  }
}
