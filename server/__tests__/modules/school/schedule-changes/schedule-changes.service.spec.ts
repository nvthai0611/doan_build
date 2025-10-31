import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleChangesService } from './schedule-changes.service';

describe('ScheduleChangesService', () => {
  let service: ScheduleChangesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleChangesService],
    }).compile();

    service = module.get<ScheduleChangesService>(ScheduleChangesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
