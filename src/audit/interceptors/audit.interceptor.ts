import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../audit.service';

/**
 * Mapa semântico: converte método HTTP + padrão de rota em uma ação legível.
 */
function resolveAction(method: string, route: string): string {
  const hasId = /\/:[^/]+/.test(route) || /\/[0-9a-f-]{36}/.test(route);
  switch (method.toUpperCase()) {
    case 'POST':
      // Rota de login é uma ação especial
      if (route.includes('login')) return 'LOGIN';
      return 'CREATE';
    case 'GET':
      return hasId ? 'READ_ONE' : 'READ_ALL';
    case 'PATCH':
    case 'PUT':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return method.toUpperCase();
  }
}

/**
 * Extrai o nome do recurso a partir da rota (ex: /api/v1/vehicles/123 → vehicles).
 */
function resolveResource(url: string): string {
  // Remove query string e prefixo /api/v1/
  const clean = url.split('?')[0].replace(/^\/api\/v1\//, '');
  // Pega o primeiro segmento de caminho
  return clean.split('/')[0] || 'unknown';
}

/**
 * Remove campos sensíveis do corpo da requisição antes de persistir no log.
 */
function sanitizeBody(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') return {};
  const sensitive = ['password', 'senha', 'token', 'secret', 'access_token'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  }
  return sanitized;
}

/**
 * Interceptor global que registra todas as interações HTTP da API no MongoDB.
 * Captura tanto respostas bem-sucedidas quanto erros, garantindo rastreabilidade completa.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const route = request.route?.path || request.url;
    const url = request.url;
    const resource = resolveResource(url);
    const action = resolveAction(method, route);
    const userId: string | null = (request as any).user?.userId ?? null;
    const userEmail: string | null = (request as any).user?.email ?? null;
    const params = request.params ?? {};
    const requestBody = sanitizeBody(request.body ?? {});
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      null;
    const userAgent = request.headers['user-agent'] || null;
    const timestamp = new Date();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.auditService.log({
          method,
          route,
          resource,
          action,
          userId,
          userEmail,
          params,
          requestBody,
          statusCode,
          success: statusCode < 400,
          errorMessage: null,
          ipAddress,
          userAgent,
          durationMs,
          timestamp,
        });
      }),
      catchError((error) => {
        const durationMs = Date.now() - startTime;
        const statusCode = error.status ?? 500;

        this.auditService.log({
          method,
          route,
          resource,
          action,
          userId,
          userEmail,
          params,
          requestBody,
          statusCode,
          success: false,
          errorMessage: error.message ?? 'Erro desconhecido',
          ipAddress,
          userAgent,
          durationMs,
          timestamp,
        });

        return throwError(() => error);
      }),
    );
  }
}
