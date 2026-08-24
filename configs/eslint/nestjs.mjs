import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from './base.mjs';

export const nestjsConfig = tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'src/common/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);

export default nestjsConfig;
