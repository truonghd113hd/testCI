import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, call$: CallHandler<any>): Observable<any> {
    return call$.handle().pipe(
      map((data) => {
        const metadata = Object.assign({}, data.metadata);
        const items = Object.assign({}, data.items);
        return { data: Object.values(items), metadata };
      }),
    );
  }
}
