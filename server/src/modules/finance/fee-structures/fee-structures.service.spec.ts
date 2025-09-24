import { Test, TestingModule } from '@nestjs/testing';
import { FeeStructuresService } from './fee-structures.service';

describe('FeeStructuresService', () => {
  let service: FeeStructuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeeStructuresService],
    }).compile();

    service = module.get<FeeStructuresService>(FeeStructuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
