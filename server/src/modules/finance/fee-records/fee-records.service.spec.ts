import { Test, TestingModule } from '@nestjs/testing';
import { FeeRecordsService } from './fee-records.service';

describe('FeeRecordsService', () => {
  let service: FeeRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeeRecordsService],
    }).compile();

    service = module.get<FeeRecordsService>(FeeRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
