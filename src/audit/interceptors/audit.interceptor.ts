import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../audit.service';

function resolveAction(method: string, route: string): string {
  const hasId = /\/:[^/]+/.test(route) || /\/[0-9a-f-]{36}/.test(route);
  switch (method.toUpperCase()) {
    case 'POST': return route.includes('login') ? 'LOGIN' : 'CREATE';
    case 'GET': return hasId ? 'READ_ONE' : 'READ_ALL';
    case 'PATCH': case 'PUT': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return method.toUpperCase();
  }
}

function resolveResource(url: string): string {
  const clean = url.split('?')[0].replace(/^\/api\/v1\//, '');
  return clean.split('/')[0] || 'unknown';
}

function sanitizeBody(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') return {};
  const sensitive = ['password', 'senha', 'token', 'secret', 'access_token'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (key in sanitized) sanitized[key] = '***REDACTED***';
  }
  return sanitized;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap(async () => {
        // Aguarda a gravação do log antes de finalizar a resposta no interceptor
        await this.saveLog(request, response, startTime, null);
      }),
      catchError(async (error) => {
        await this.saveLog(request, response, startTime, error);
        return throwError(() => error);
      }),
    );
  }

  private async saveLog(request: any, response: any, startTime: number, error: any) {
    const durationMs = Date.now() - startTime;
    const statusCode = error ? (error.status ?? 500) : response.statusCode;
    
    await this.auditService.log({
      method: request.method,
      route: request.route?.path || request.url,
      resource: resolveResource(request.url),
      action: resolveAction(request.method, request.route?.path || request.url),
      userId: request.user?.userId ?? null,
      userEmail: request.user?.email ?? null,
      params: request.params ?? {},
      requestBody: sanitizeBody(request.body ?? {}),
      statusCode,
      success: statusCode < 400,
      errorMessage: error?.message ?? null,
      ipAddress: request.ip || request.socket?.remoteAddress || null,
      userAgent: request.headers['user-agent'] || null,
      durationMs,
      timestamp: new Date(),
    });
  }
}
