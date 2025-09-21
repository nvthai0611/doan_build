import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentLinksService } from './student-parent-links.service';

describe('StudentParentLinksService', () => {
  let service: StudentParentLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentParentLinksService],
    }).compile();

    service = module.get<StudentParentLinksService>(StudentParentLinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
