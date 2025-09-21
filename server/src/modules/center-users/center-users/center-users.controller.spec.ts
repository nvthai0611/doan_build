import { Test, TestingModule } from '@nestjs/testing';
import { CenterUsersController } from './center-users.controller';
import { CenterUsersService } from './center-users.service';

describe('CenterUsersController', () => {
  let controller: CenterUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CenterUsersController],
      providers: [CenterUsersService],
    }).compile();

    controller = module.get<CenterUsersController>(CenterUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
