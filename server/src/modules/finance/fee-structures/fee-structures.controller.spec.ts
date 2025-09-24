import { Test, TestingModule } from '@nestjs/testing';
import { FeeStructuresController } from './fee-structures.controller';

describe('FeeStructuresController', () => {
  let controller: FeeStructuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeeStructuresController],
    }).compile();

    controller = module.get<FeeStructuresController>(FeeStructuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
