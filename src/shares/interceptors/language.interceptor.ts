import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LANGUAGE } from '../constants/constant';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    let language = request.headers['accept-language'] || LANGUAGE.EN;
    language = Object.values(LANGUAGE).includes(language) ? language : LANGUAGE.EN;
    request.language = language;
    return next.handle();
  }
}
