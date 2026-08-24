import type { LanguageCodeVo } from '../common';

export interface TemplateRendererDrivenPort {
  render(
    templateName: string,
    language: LanguageCodeVo,
    data: Record<string, unknown>,
  ): Promise<string>;
}

export const TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN = Symbol(
  'TemplateRendererDrivenPort',
);
