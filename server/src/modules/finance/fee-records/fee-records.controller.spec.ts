import { Test, TestingModule } from '@nestjs/testing';
import { FeeRecordsController } from './fee-records.controller';

describe('FeeRecordsController', () => {
  let controller: FeeRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeeRecordsController],
    }).compile();

    controller = module.get<FeeRecordsController>(FeeRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
