import type { NavigationMenuItem } from '@nuxt/ui';
import type { RouteRecordRaw } from 'vue-router';

// biome-ignore lint/suspicious/noExplicitAny: Compatible with Vue I18n LocaleMessageValue tree
export type FeatureI18nRecord = Record<string, any>;

export interface FeatureI18n {
  en?: FeatureI18nRecord;
  es?: FeatureI18nRecord;
}

export interface FeatureDefinition {
  name: string;
  routes?: RouteRecordRaw[];
  i18n?: FeatureI18n;
  navigation?: NavigationMenuItem[];
}
