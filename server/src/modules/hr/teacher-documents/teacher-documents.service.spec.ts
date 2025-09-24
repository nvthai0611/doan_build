import { Test, TestingModule } from '@nestjs/testing';
import { TeacherDocumentsService } from './teacher-documents.service';

describe('TeacherDocumentsService', () => {
  let service: TeacherDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeacherDocumentsService],
    }).compile();

    service = module.get<TeacherDocumentsService>(TeacherDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
