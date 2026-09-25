import { describe, expect, it } from 'vitest';
import {
  getFeatureI18n,
  getFeatureNavigation,
  getFeatureRoutes,
  getFeatures,
} from '../../app/features/registry';

describe('Feature Registry Architecture', () => {
  it('should discover all registered features', () => {
    const features = getFeatures();
    expect(features.length).toBeGreaterThan(0);

    const names = features.map((f) => f.name);
    expect(names).toContain('auth');
    expect(names).toContain('core');
    expect(names).toContain('security');
  });

  it('should aggregate feature routes correctly', () => {
    const routes = getFeatureRoutes();
    expect(routes.length).toBeGreaterThan(0);

    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/login');
    expect(paths).toContain('/register');
  });

  it('should aggregate and merge i18n dictionaries by feature', () => {
    const i18n = getFeatureI18n();

    expect(i18n).toHaveProperty('en');
    expect(i18n).toHaveProperty('es');
    expect(i18n.en).toHaveProperty('auth');
    expect(i18n.es).toHaveProperty('auth');
    expect(i18n.en).toHaveProperty('security');
    expect(i18n.es).toHaveProperty('security');
  });

  it('should return aggregated navigation items', () => {
    const navItems = getFeatureNavigation();
    expect(Array.isArray(navItems)).toBe(true);
  });
});
