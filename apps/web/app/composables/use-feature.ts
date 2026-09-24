import type { FeatureDefinition } from '~/types/feature';
import {
  getFeatureI18n,
  getFeatureNavigation,
  getFeatureRoutes,
  getFeatures,
} from '~/features/registry';

/**
 * Helper to define a strongly-typed feature module with auto-discovery support.
 */
export function defineFeature(config: FeatureDefinition): FeatureDefinition {
  return config;
}

/**
 * Composable to access all discovered features, routes, and navigation items.
 */
export const useFeatureRegistry = () => {
  return {
    features: getFeatures(),
    routes: getFeatureRoutes(),
    i18n: getFeatureI18n(),
    navigation: getFeatureNavigation(),
  };
};
