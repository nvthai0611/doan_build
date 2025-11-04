import { Test, TestingModule } from '@nestjs/testing';
import { FinancialManagementService } from './financial-management.service';

describe('FinancialManagementService', () => {
  let service: FinancialManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialManagementService],
    }).compile();

    service = module.get<FinancialManagementService>(FinancialManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
