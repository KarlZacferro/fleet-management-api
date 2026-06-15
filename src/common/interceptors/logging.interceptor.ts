import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InteractionLog } from '../schemas/log.schema';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(InteractionLog.name) private logModel: Model<InteractionLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const duration = `${Date.now() - startTime}ms`;
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Salva a interação no MongoDB
        await this.logModel.create({
          method,
          url,
          body,
          user: user ? { id: user.userId, email: user.email } : 'Anonymous',
          statusCode,
          duration,
        });
      }),
    );
  }
}
