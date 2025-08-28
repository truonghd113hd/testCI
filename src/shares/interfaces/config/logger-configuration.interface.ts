export interface ILoggerConfiguration {
  level: string;
  useFile: boolean;
}

export interface PinoRedactConfig {
  enabled: boolean;
  paths: string[];
  censor?: any;
}

export interface PinoConfig {
  enabled?: boolean;
  redact?: PinoRedactConfig;
}
