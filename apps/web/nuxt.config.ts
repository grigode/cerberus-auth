import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  telemetry: false,
  devtools: { enabled: false },
  modules: [
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/i18n',
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    },
  },
  vite: { plugins: [tailwindcss()] },
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    vueI18n: '~/i18n/i18n.config.ts',
  },
});
