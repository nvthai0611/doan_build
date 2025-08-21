import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProductsService } from 'src/products/products.service';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ProductsService, PrismaClient, PrismaService],
})
export class UsersModule {}
