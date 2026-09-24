import { defineFeature } from '~/composables/use-feature';
import { i18n } from './auth.i18n';
import { router } from './auth.router';

export default defineFeature({
  name: 'auth',
  routes: router,
  i18n,
});
