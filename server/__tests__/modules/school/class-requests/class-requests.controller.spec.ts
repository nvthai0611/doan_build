import { Test, TestingModule } from '@nestjs/testing';
import { ClassRequestsController } from './class-requests.controller';

describe('ClassRequestsController', () => {
  let controller: ClassRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassRequestsController],
    }).compile();

    controller = module.get<ClassRequestsController>(ClassRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
