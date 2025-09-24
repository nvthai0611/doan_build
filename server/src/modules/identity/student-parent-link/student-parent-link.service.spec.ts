import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentLinkService } from './student-parent-link.service';

describe('StudentParentLinkService', () => {
  let service: StudentParentLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentParentLinkService],
    }).compile();

    service = module.get<StudentParentLinkService>(StudentParentLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
