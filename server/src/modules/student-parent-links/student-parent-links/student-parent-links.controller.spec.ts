import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentLinksController } from './student-parent-links.controller';
import { StudentParentLinksService } from './student-parent-links.service';

describe('StudentParentLinksController', () => {
  let controller: StudentParentLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentParentLinksController],
      providers: [StudentParentLinksService],
    }).compile();

    controller = module.get<StudentParentLinksController>(StudentParentLinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
