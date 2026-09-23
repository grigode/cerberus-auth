<script setup lang="ts">
import AuthStateCard from '~/features/auth/components/AuthStateCard.vue';

const { ts: tsHead } = useI18nShorter('auth.confirmEmailPending.head');
const { ts } = useI18nShorter('auth.confirmEmailPending.content');

useSeoMeta({ title: tsHead('title') });
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <AuthStateCard
        icon="i-lucide-mail-check"
        :title="ts('title')"
        :description="ts('description')"
      >
        <USeparator />

        <p>
          {{ ts("footer.question") }}
          <NuxtLink to="/login" class="underline">
            {{ ts("footer.link") }}
          </NuxtLink>
        </p>
      </AuthStateCard>
    </UPageCard>
  </div>
</template>
