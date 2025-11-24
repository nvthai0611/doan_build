import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { QueryAuditLogDto } from '../dto/audit-log/query-audit-log.dto';

@ApiTags('Admin Center - Audit Log')
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách audit log' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'tableName', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'recordId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  async getAuditLogs(@Query() query: QueryAuditLogDto) {
    return this.auditLogService.getAuditLogs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết audit log' })
  async getAuditLogById(@Param('id') id: string) {
    return this.auditLogService.getAuditLogById(id);
  }
}

