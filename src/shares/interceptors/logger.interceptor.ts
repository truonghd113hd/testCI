import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { httpRequestLog, httpResponseLog } from '../logger/Logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    httpRequestLog(req);
    return next.handle().pipe(
      map((data) => {
        httpResponseLog(req, res);
        return data;
      }),
    );
  }
}
