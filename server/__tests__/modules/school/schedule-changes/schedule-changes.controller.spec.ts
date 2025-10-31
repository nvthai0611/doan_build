import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleChangesController } from './schedule-changes.controller';

describe('ScheduleChangesController', () => {
  let controller: ScheduleChangesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleChangesController],
    }).compile();

    controller = module.get<ScheduleChangesController>(ScheduleChangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
