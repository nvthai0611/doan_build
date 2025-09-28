import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PrismaService } from "src/db/prisma.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, PrismaService],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
