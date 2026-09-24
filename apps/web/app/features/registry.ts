import type { NavigationMenuItem } from '@nuxt/ui';
import type { RouteRecordRaw } from 'vue-router';
import type { FeatureDefinition, FeatureI18nRecord } from '~/types/feature';

/**
 * Discovers and collects all feature definitions via Vite's import.meta.glob.
 * Any *.feature.ts file placed inside app/features/<feature>/ is automatically registered.
 */
export function getFeatures(): FeatureDefinition[] {
  const modules = import.meta.glob<{
    default?: FeatureDefinition;
    feature?: FeatureDefinition;
  }>('./*/*.feature.ts', { eager: true });

  const features: FeatureDefinition[] = [];

  for (const path in modules) {
    const mod = modules[path];
    const def = mod?.default || mod?.feature;
    if (def && typeof def.name === 'string') {
      features.push(def);
    }
  }

  return features;
}

/**
 * Aggregates all routes from discovered features.
 */
export function getFeatureRoutes(): RouteRecordRaw[] {
  return getFeatures().flatMap((feature) => feature.routes || []);
}

/**
 * Aggregates and merges all i18n messages from discovered features by feature name.
 * Example structure:
 * {
 *   en: { auth: { ... }, core: { ... } },
 *   es: { auth: { ... }, core: { ... } }
 * }
 */
export function getFeatureI18n(): {
  en: Record<string, FeatureI18nRecord>;
  es: Record<string, FeatureI18nRecord>;
} {
  const en: Record<string, FeatureI18nRecord> = {};
  const es: Record<string, FeatureI18nRecord> = {};

  for (const feature of getFeatures()) {
    if (feature.i18n?.en) {
      en[feature.name] = feature.i18n.en;
    }
    if (feature.i18n?.es) {
      es[feature.name] = feature.i18n.es;
    }
  }

  return { en, es };
}

/**
 * Aggregates navigation items defined across features.
 */
export function getFeatureNavigation(): NavigationMenuItem[] {
  return getFeatures().flatMap((feature) => feature.navigation || []);
}
