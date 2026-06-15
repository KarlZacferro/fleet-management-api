import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';

/**
 * Controller que expõe os registros de auditoria do MongoDB via endpoints REST.
 * Todas as rotas são protegidas por autenticação JWT.
 */
@Controller('audit')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Retorna todos os registros de auditoria, do mais recente ao mais antigo.
   * GET /api/v1/audit
   */
  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  /**
   * Retorna os registros de auditoria filtrados por recurso.
   * GET /api/v1/audit/resource/:resource
   * Exemplo: /api/v1/audit/resource/vehicles
   */
  @Get('resource/:resource')
  findByResource(@Param('resource') resource: string) {
    return this.auditService.findByResource(resource);
  }

  /**
   * Retorna os registros de auditoria de um usuário específico.
   * GET /api/v1/audit/user/:userId
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}
