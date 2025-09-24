import { Test, TestingModule } from '@nestjs/testing';
import { StudentParentLinkController } from './student-parent-link.controller';

describe('StudentParentLinkController', () => {
  let controller: StudentParentLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentParentLinkController],
    }).compile();

    controller = module.get<StudentParentLinkController>(StudentParentLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
