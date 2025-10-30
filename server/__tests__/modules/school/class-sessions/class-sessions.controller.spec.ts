import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsController } from './class-sessions.controller';

describe('ClassSessionsController', () => {
  let controller: ClassSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSessionsController],
    }).compile();

    controller = module.get<ClassSessionsController>(ClassSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
