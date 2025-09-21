import { Test, TestingModule } from '@nestjs/testing';
import { CenterUsersService } from './center-users.service';

describe('CenterUsersService', () => {
  let service: CenterUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CenterUsersService],
    }).compile();

    service = module.get<CenterUsersService>(CenterUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
