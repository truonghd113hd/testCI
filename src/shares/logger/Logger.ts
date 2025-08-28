import { pino } from 'pino';
import * as httpContext from 'express-http-context';
import * as BPromise from 'bluebird';
import * as jsonWebToken from 'jsonwebtoken';
import { PinoConfig } from '../interfaces/config/logger-configuration.interface';
import crypto from 'crypto';

import { getConfig } from '../../shares/helpers/utils';
const config = getConfig();

const jwt = BPromise.promisifyAll(jsonWebToken);

export const pinoConfig: PinoConfig = {
  ...config.get<PinoConfig>('pino'),
  redact: {
    ...config.get('pino.redact'),
    paths:
      config.get<boolean>('pino.redact.enabled') && config.get<string[]>('pino.redact.paths')
        ? config.get('pino.redact.paths')
        : [],
  },
};

export const logEnabled = pinoConfig.enabled;
const serviceName = config.get('app.name');
const env = process.env.NODE_ENV || 'development';
const logger = pino(pinoConfig);

export interface ILogEntry {
  level: LogLevel;
  message: string;
  [optionName: string]: any;
}

export enum LogLevel {
  Fatal,
  Error,
  Warning,
  Info,
  Debug,
}

const logLevelFunc = {
  [LogLevel.Error]: logger.error,
  [LogLevel.Warning]: logger.warn,
  [LogLevel.Info]: logger.info,
  [LogLevel.Debug]: logger.debug,
  [LogLevel.Fatal]: logger.fatal,
};

const log = (
  level: LogLevel,
  {
    message,
    data,
    methodName,
  }: {
    message?: string;
    data?: any;
    methodName?: string;
  },
) => {
  const logFunc = logLevelFunc[level];

  if (!logFunc) {
    logger.fatal({}, `No log func for level ${level}`);
    return;
  }

  if (logEnabled) {
    const correlationId = getCorrelationId();
    const correlationIdMsg = !!correlationId ? `[${correlationId}]` : '';
    const methodNameMsg = !!methodName ? `[${methodName}]` : '';
    const userId = data?.userId || httpContext.get('userId');
    message = `[${env}][${serviceName}]` + correlationIdMsg + methodNameMsg + `: ${message}`;
    logFunc.call(logger, { ...data, correlationId, userId }, message);
  }
};

export const errorLog = (message?: string, data?: any, methodName?: string) => {
  log(LogLevel.Error, { message, data, methodName });
};

export const debugLog = (message?: string, data?: any, methodName?: string): void => {
  log(LogLevel.Debug, { message, data, methodName });
};

export const infoLog = (message?: string, data?: any, methodName?: string): void => {
  log(LogLevel.Info, { message, data, methodName });
};

export const warnLog = (message?: string, data?: any, methodName?: string): void => {
  log(LogLevel.Warning, { message, data, methodName });
};

export const fatalLog = (message?: string, data?: any, methodName?: string): void => {
  log(LogLevel.Fatal, { message, data, methodName });
};

export function apiLog(req?: any, res?: any) {
  const data: any = {};
  if (req) {
    data.request = { ...req };
  }

  if (res) {
    data.response = { ...res };
    delete data.response.obj;
    delete data.response.data;
    delete data.response.text;
  }

  debugLog(data);
}

export const httpRequestLog = (req: any) => {
  const requestLog = {
    correlationId: req.correlationId,
    userId: decodeJWTToken(req.headers['access-token'])?.sub,
    message: `HTTP Request`,
    data: {
      clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      method: req.method,
      originalUri: req.originalUrl,
      uri: req.url,
      referer: req.headers.referer || '',
      userAgent: req.headers['user-agent'],
      req: {
        body: tryParseJsonString(Object.assign({}, req.body)),
        headers: req.headers,
      },
    },
  };
  log(LogLevel.Debug, requestLog);
};

export const httpResponseLog = (req: any, res: any) => {
  const elapsedStart = req.timestamp ? req.timestamp : 0;
  const elapsedEnd = Date.now();
  const processTime = `${elapsedStart > 0 ? elapsedEnd - elapsedStart : 0}ms`;
  let correlationId = req.correlationId;
  if (!correlationId) {
    correlationId = crypto.randomUUID();
    req.correlationId = correlationId;
  }
  res.setHeader('x-request-id', correlationId);
  res.setHeader('x-process-time', processTime);
  const rawResponse = res.write;
  const rawResponseEnd = res.end;
  const chunks = [];
  res.write = (...args) => {
    const restArgs = [];
    for (let i = 0; i < args.length; i++) {
      restArgs[i] = args[i];
    }
    chunks.push(Buffer.from(restArgs[0]));
    rawResponse.apply(res, restArgs);
  };
  res.end = (...args) => {
    const restArgs = [];
    for (let i = 0; i < args.length; i++) {
      restArgs[i] = args[i];
    }
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const responseLog = {
      timestamp: new Date(elapsedEnd).toISOString(),
      correlationId: req.correlationId,
      level: LogLevel.Debug,
      userId: decodeJWTToken(req.headers['access-token'])?.sub,
      message: `HTTP Response - ${processTime}`,
      data: {
        req: {
          body: req.body,
          headers: req.headers,
        },
        res: {
          body: tryParseJsonString(body),
          headers: res.getHeaders(),
        },
        statusCode: res.statusCode,
        clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        method: req.method,
        originalUri: req.originalUrl,
        uri: req.url,
        referer: req.headers.referer || '',
        userAgent: req.headers['user-agent'],
        processTime,
      },
    };
    log(LogLevel.Debug, responseLog);
    rawResponseEnd.apply(res, restArgs);
  };
};

export function decodeJWTToken(token: string) {
  return jwt.decode(token);
}

export function tryParseJsonString(value: any): any {
  try {
    const jsonObj = JSON.parse(value);
    return jsonObj;
  } catch (e) {
    return value;
  }
}

export function setCorrelationId(req, res, next) {
  req.timestamp = Date.now();
  const correlationId = crypto.randomUUID();
  req.correlationId = correlationId;
  httpContext.set('correlationId', correlationId);
  next();
}

export function getCorrelationId(): string {
  let correlationId = httpContext.get('correlationId');
  if (!correlationId) {
    correlationId = crypto.randomUUID();
    httpContext.set('correlationId', correlationId);
  }
  return correlationId;
}
