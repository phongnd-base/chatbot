import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req?.method;
    const url = req?.originalUrl || req?.url;
    const userId = req?.user?.userId;
    const started = Date.now();
    this.logger.log(`→ ${method} ${url}${userId ? ` uid=${userId}` : ''}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(`← ${method} ${url} ok ${ms}ms${userId ? ` uid=${userId}` : ''}`);
        },
        error: (err) => {
          const ms = Date.now() - started;
          this.logger.error(`× ${method} ${url} ${ms}ms${userId ? ` uid=${userId}` : ''}: ${err?.message || err}`);
        },
      }),
    );
  }
}
