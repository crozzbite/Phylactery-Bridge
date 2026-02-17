
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const mockAuthService = {
  register: jest.fn(),
  getUserProfile: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
        const dto: RegisterDto = { firebaseToken: 'token' };
        const user = { id: '1', email: 'test@phylactery.ai', firebaseUid: 'uid', role: 'FREE', createdAt: new Date() };
        // plainToInstance with excludeExtraneousValues: true will strip firebaseUid and keep exposed fields
        const expectedResponse = { 
            id: '1', 
            email: 'test@phylactery.ai', 
            role: 'FREE', 
            createdAt: user.createdAt 
        };
        
        mockAuthService.register.mockResolvedValue(user);

        const response = await controller.register(dto);
        expect(response).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
        const req = { user: { uid: 'uid' } };
        const user = { id: '1', email: 'test@phylactery.ai', firebaseUid: 'uid', role: 'FREE', createdAt: new Date() };
        const expectedResponse = { 
            id: '1', 
            email: 'test@phylactery.ai', 
            role: 'FREE', 
            createdAt: user.createdAt 
        };

        mockAuthService.getUserProfile.mockResolvedValue(user);

        const response = await controller.getProfile(req);
        expect(response).toEqual(expectedResponse);
        expect(service.getUserProfile).toHaveBeenCalledWith('uid');
    });
  });
});
