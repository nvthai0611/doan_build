import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, PrismaService]
})
export class ClassesModule {}
