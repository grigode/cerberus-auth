export abstract class Controller<Request, Response> {
  abstract handle(...args: Request[]): Promise<Response> | Response;
}
