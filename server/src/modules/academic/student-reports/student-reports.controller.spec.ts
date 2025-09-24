import { Test, TestingModule } from '@nestjs/testing';
import { StudentReportsController } from './student-reports.controller';

describe('StudentReportsController', () => {
  let controller: StudentReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentReportsController],
    }).compile();

    controller = module.get<StudentReportsController>(StudentReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
