import {
  Inject as NestInject,
  Injectable as NestInjectable,
  type MessageEvent as NestMessageEvent,
} from '@nestjs/common';

type InjectionToken = symbol | string | (new (...args: unknown[]) => unknown);

export const Inject = (token: InjectionToken) => {
  return NestInject(token);
};

export const Injectable = NestInjectable;
export type MessageEvent = NestMessageEvent;
