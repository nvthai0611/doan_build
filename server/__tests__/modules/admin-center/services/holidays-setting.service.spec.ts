import { Test, TestingModule } from '@nestjs/testing';
import { HolidaysSettingService } from './holidays-setting.service';

describe('HolidaysSettingService', () => {
  let service: HolidaysSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HolidaysSettingService],
    }).compile();

    service = module.get<HolidaysSettingService>(HolidaysSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
