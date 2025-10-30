import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PermissionService } from "./permission.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { PrismaService } from "src/db/prisma.service";
import { AdminCenterModule } from "../admin-center/admin-center.module";

@Module({
  imports: [AdminCenterModule],
  controllers: [AuthController],
  providers: [AuthService, PermissionService, JwtAuthGuard, RolesGuard, PrismaService],
  exports: [AuthService, PermissionService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
