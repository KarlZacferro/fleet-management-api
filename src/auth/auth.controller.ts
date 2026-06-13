import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

// Controlador para lidar com requisições de autenticação
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Endpoint POST para login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    // Valida o usuário e senha
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    // Retorna o token de acesso
    return this.authService.login(user);
  }
}
