import { Test, TestingModule } from '@nestjs/testing';
import { TeacherDocumentsController } from './teacher-documents.controller';

describe('TeacherDocumentsController', () => {
  let controller: TeacherDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherDocumentsController],
    }).compile();

    controller = module.get<TeacherDocumentsController>(TeacherDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
