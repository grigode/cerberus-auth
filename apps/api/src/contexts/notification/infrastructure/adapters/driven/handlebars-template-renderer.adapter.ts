import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { LanguageCode, type TemplateRendererDrivenPort } from '@core/domain';
import * as handlebars from 'handlebars';

@Injectable()
export class HandlebarsTemplateRendererAdapter
  implements TemplateRendererDrivenPort
{
  private readonly logger = new Logger(HandlebarsTemplateRendererAdapter.name);

  async render(
    templateName: string,
    language: LanguageCode,
    context: Record<string, unknown>,
  ): Promise<string> {
    const langStr = (language || LanguageCode.EN).toLowerCase();
    const candidatePaths = [
      path.join(
        __dirname,
        '..',
        '..',
        'templates',
        langStr,
        `${templateName}.html`,
      ),
      path.join(
        __dirname,
        '..',
        '..',
        'templates',
        langStr,
        `${templateName}.hbs`,
      ),
      path.join(
        process.cwd(),
        'templates',
        'emails',
        langStr,
        `${templateName}.html`,
      ),
      path.join(
        process.cwd(),
        'templates',
        'emails',
        langStr,
        `${templateName}.hbs`,
      ),
    ];

    for (const tPath of candidatePaths) {
      try {
        const content = await fs.readFile(tPath, 'utf-8');
        const compiled = handlebars.compile(content);
        return compiled(context);
      } catch {
        // try next candidate
      }
    }

    // Fallback to default 'en' if requested language template not found
    if (langStr !== 'en') {
      const fallbackPaths = [
        path.join(
          __dirname,
          '..',
          '..',
          'templates',
          'en',
          `${templateName}.html`,
        ),
        path.join(
          __dirname,
          '..',
          '..',
          'templates',
          'en',
          `${templateName}.hbs`,
        ),
        path.join(
          process.cwd(),
          'templates',
          'emails',
          'en',
          `${templateName}.html`,
        ),
        path.join(
          process.cwd(),
          'templates',
          'emails',
          'en',
          `${templateName}.hbs`,
        ),
      ];

      for (const fPath of fallbackPaths) {
        try {
          const content = await fs.readFile(fPath, 'utf-8');
          const compiled = handlebars.compile(content);
          return compiled(context);
        } catch {
          // try next fallback
        }
      }
    }

    const err = new Error(
      `Email template [${templateName}] not found for language [${language}]`,
    );
    this.logger.error(err.message);
    throw err;
  }
}
