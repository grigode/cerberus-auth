import fs from 'fs';

import { FastifyAdapter } from '@nestjs/platform-fastify';

export const createFastifyAdapter = () => {
  const isHttps = process.env.HTTPS_ENABLED === 'true';

  if (!isHttps) return new FastifyAdapter();

  const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
  const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;

  if (!HTTPS_KEY_PATH || !HTTPS_CERT_PATH)
    throw new Error(
      'HTTPS is enabled but HTTPS_KEY_PATH or HTTPS_CERT_PATH is not defined',
    );

  return new FastifyAdapter({
    https: {
      key: fs.readFileSync(HTTPS_KEY_PATH),
      cert: fs.readFileSync(HTTPS_CERT_PATH),
    },
  });
};
