export interface ErrorResponse {
  code?: string;
  statusCode?: number;
  message?: string | string[];
  correlationId?: string;
}
