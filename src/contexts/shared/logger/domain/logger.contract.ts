export type Attributes = Record<string, unknown>;

export interface Context {
  attributes?: Attributes;
}

export type Message = string;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Logger {
  debug(message: Message, context?: Context): void;
  info(message: Message, context?: Context): void;
  warm(message: Message, context?: Context): void;
  error(message: Message, context?: Context): void;
}
