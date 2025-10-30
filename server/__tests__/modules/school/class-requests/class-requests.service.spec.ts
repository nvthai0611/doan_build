import { Test, TestingModule } from '@nestjs/testing';
import { ClassRequestsService } from './class-requests.service';

describe('ClassRequestsService', () => {
  let service: ClassRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassRequestsService],
    }).compile();

    service = module.get<ClassRequestsService>(ClassRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
