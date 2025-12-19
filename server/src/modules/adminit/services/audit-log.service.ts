import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { QueryAuditLogDto } from '../dto/audit-log/query-audit-log.dto';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';

export interface CreateAuditLogDto {
  userId: string;
  action: 'create' | 'update' | 'delete' | string;
  tableName: string;
  recordId?: string | null;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(query: QueryAuditLogDto) {
    const {
      search,
      action,
      tableName,
      userId,
      recordId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};

    if (action && action !== 'all') {
      where.action = action;
    }

    if (tableName) {
      where.tableName = {
        contains: tableName,
        mode: 'insensitive',
      };
    }

    if (userId) {
      where.userId = userId;
    }

    if (recordId) {
      where.recordId = recordId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { tableName: { contains: search, mode: 'insensitive' } },
        { recordId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        {
          performedBy: {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
    if (sortBy === 'timestamp') {
      orderBy.timestamp = sortOrder;
    } else if (sortBy === 'action') {
      orderBy.action = sortOrder;
    } else if (sortBy === 'tableName') {
      orderBy.tableName = sortOrder;
    }

    // Execute query
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          performedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs.map((log) => ({
        id: log.id.toString(),
        userId: log.userId,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        oldValues: log.oldValues,
        newValues: log.newValues,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        performedBy: log.performedBy,
      })),
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      message: 'Lấy danh sách audit log thành công',
    };
  }

  async getAuditLogById(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id: BigInt(id) },
      include: {
        performedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new HttpException('Không tìm thấy audit log', HttpStatus.NOT_FOUND);
    }

    return {
      data: {
        id: log.id.toString(),
        userId: log.userId,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        oldValues: log.oldValues,
        newValues: log.newValues,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        performedBy: log.performedBy,
      },
      message: 'Lấy chi tiết audit log thành công',
    };
  }

  /**
   * Tạo audit log mới
   * Method này có thể được gọi từ bất kỳ service nào để ghi lại hoạt động
   */
  async createAuditLog(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: dto.userId,
          action: dto.action,
          tableName: dto.tableName,
          recordId: dto.recordId || null,
          oldValues: dto.oldValues ? (typeof dto.oldValues === 'object' ? dto.oldValues : JSON.parse(dto.oldValues)) : null,
          newValues: dto.newValues ? (typeof dto.newValues === 'object' ? dto.newValues : JSON.parse(dto.newValues)) : null,
          ipAddress: dto.ipAddress || null,
          userAgent: dto.userAgent || null,
        },
      });
    } catch (error) {
      // Log error nhưng không throw để không ảnh hưởng đến flow chính
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Helper method để tạo audit log cho các thao tác CRUD
   */
  async logCrudOperation(
    userId: string,
    action: 'create' | 'update' | 'delete',
    tableName: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      action,
      tableName,
      recordId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }
}

