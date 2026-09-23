export const useI18nShorter = (prefix: string) => {
  const { t } = useI18n();

  const shorter = (next: string, named?: Record<string, unknown>) =>
    named ? t(`${prefix}.${next}`, named) : t(`${prefix}.${next}`);

  return { ts: shorter };
};
