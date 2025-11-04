import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalManagementService } from './approval-management.service';

describe('ApprovalManagementService', () => {
  let service: ApprovalManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalManagementService],
    }).compile();

    service = module.get<ApprovalManagementService>(ApprovalManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
