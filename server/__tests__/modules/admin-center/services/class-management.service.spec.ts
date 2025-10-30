import { Test, TestingModule } from '@nestjs/testing';
import { ClassManagementService } from './class-management.service';

describe('ClassManagementService', () => {
  let service: ClassManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassManagementService],
    }).compile();

    service = module.get<ClassManagementService>(ClassManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
