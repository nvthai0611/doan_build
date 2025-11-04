import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentManagementService } from './enrollment-management.service';

describe('EnrollmentManagementService', () => {
  let service: EnrollmentManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrollmentManagementService],
    }).compile();

    service = module.get<EnrollmentManagementService>(EnrollmentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
