export interface Controller<_Request = unknown, Response = unknown> {
  // biome-ignore lint/suspicious/noExplicitAny: NestJS controller methods take arbitrary decorated arguments
  // biome-ignore lint/suspicious/noConfusingVoidType: Controller methods can return void or Promise<void>
  handle(...args: any[]): Promise<Response | void> | Response | void;
}
