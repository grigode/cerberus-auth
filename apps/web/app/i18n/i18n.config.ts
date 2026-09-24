import { getFeatureI18n } from '~/features/registry';

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  messages: getFeatureI18n(),
}));
