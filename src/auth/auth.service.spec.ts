import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;

  // Feito para usar a mesma senha do teste de sucesso
  const mockUser = { id: 'u1', email: 'a@a.com', password: '123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: UsersService, 
          useValue: { findByEmail: jest.fn() }
        },
        { 
          provide: JwtService, 
          useValue: { sign: jest.fn().mockReturnValue('token') }
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  it('should return token for valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);
    
    const result = await service.login({ email: 'a@a.com', password: '123' });
    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBe('token');
  });

  it('should throw Unauthorized for invalid user', async () => {
    // Simula que o usuário NÃO existe
    usersService.findByEmail.mockResolvedValue(null);
    
    await expect(service.login({ email: 'x@x.com', password: '123' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw Unauthorized for wrong password', async () => {
    // Usuário existe mas a senha no banco é diferente da enviada
    usersService.findByEmail.mockResolvedValue(mockUser);
    
    await expect(service.login({ email: 'a@a.com', password: 'wrong_password' }))
      .rejects.toThrow(UnauthorizedException);
  });
});