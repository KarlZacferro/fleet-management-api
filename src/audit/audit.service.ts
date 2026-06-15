import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogDto {
  method: string;
  route: string;
  resource: string;
  action: string;
  userId?: string | null;
  userEmail?: string | null;
  params?: Record<string, any>;
  requestBody?: Record<string, any>;
  statusCode: number;
  success: boolean;
  errorMessage?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  durationMs: number;
  timestamp: Date;
}

/**
 * Serviço responsável por persistir registros de auditoria no MongoDB.
 * Todas as interações da API são registradas aqui para fins de rastreabilidade.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Persiste um novo registro de auditoria no MongoDB.
   * Erros de persistência são logados mas não propagados para não
   * impactar o fluxo principal da aplicação.
   */
  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      // LOG DE TESTE: Avisa que a auditoria capturou a ação
      console.log(`[Auditoria] Capturado: ${data.method} ${data.route} - Status: ${data.statusCode}`);
      
      const entry = new this.auditLogModel(data);
      await entry.save();
      
      // LOG DE SUCESSO: Confirma que o MongoDB gravou o dado
      console.log(`[Auditoria] ✅ Gravado com sucesso no MongoDB!`);
    } catch (error: any) {
      this.logger.error(
        `Falha ao persistir log de auditoria: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Retorna todos os registros de auditoria, ordenados do mais recente ao mais antigo.
   * Útil para consultas administrativas e demonstração.
   */
  async findAll(): Promise<AuditLog[]> {
    return this.auditLogModel.find().sort({ timestamp: -1 }).exec();
  }

  /**
   * Retorna os registros de auditoria filtrados por recurso (ex: 'vehicles').
   */
  async findByResource(resource: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ resource })
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Retorna os registros de auditoria de um usuário específico.
   */
  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .exec();
  }
}
