import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { isClientErrorStatus } from '../helpers/utils';
import { createGeneralExceptionError } from '../exceptions/errors';
import { debugLog, errorLog } from '../logger/Logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const responseError = createGeneralExceptionError(exception);

    const logger = isClientErrorStatus(responseError.statusCode) ? debugLog : errorLog;

    logger(responseError.message, {
      ...responseError,
      ...(exception.message.logData && { ...exception.message.logData }),
      ...(exception.message.data && { ...exception.message.data }),
      stack: exception.stack,
    });

    response.status(responseError.statusCode).json(responseError);
  }
}
