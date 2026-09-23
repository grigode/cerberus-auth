import { i18n as authI18n } from '~/features/auth/auth.i18n';
import { i18n as coreI18n } from '~/features/core/core.i18n';

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  messages: {
    en: { auth: authI18n.en, core: coreI18n.en },
    es: { auth: authI18n.es, core: coreI18n.es },
  },
}));
