import { Test, TestingModule } from '@nestjs/testing';
import { StudentReportsService } from './student-reports.service';

describe('StudentReportsService', () => {
  let service: StudentReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentReportsService],
    }).compile();

    service = module.get<StudentReportsService>(StudentReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
