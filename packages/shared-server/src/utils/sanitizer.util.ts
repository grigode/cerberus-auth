const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'secret',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'authorization',
  'auth',
  'cookie',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'ssn',
  'privatekey',
  'private_key',
]);

const MASK_STRING = '***MASKED***';

export function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item: unknown) => sanitizeData(item)) as unknown as T;
  }

  const record = data as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');

    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = MASK_STRING;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
