<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const { locale } = useI18n();

useHead({
  htmlAttrs: { lang: locale.value },
});

useSeoMeta({
  title: `${props.error?.status || 500} - Cerberus`,
});

const is404 = computed(() => props.error?.status === 404);

const handleError = () => clearError({ redirect: '/dashboard' });
</script>

<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center p-6 bg-background">
      <UCard class="max-w-md w-full text-center border-default/50 shadow-xl">
        <div class="flex flex-col items-center gap-5 py-4">
          <div
            :class="is404 ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'"
            class="rounded-full p-4"
          >
            <UIcon
              :name="is404 ? 'i-lucide-compass' : 'i-lucide-alert-triangle'"
              class="size-10"
            />
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-mono text-xs text-muted uppercase tracking-widest">
              Error {{ error?.status || 500 }}
            </span>
            <h1 class="text-2xl font-bold tracking-tight text-foreground">
              {{ is404 ? 'Page Not Found' : 'Something Went Wrong' }}
            </h1>
            <p class="text-sm text-muted leading-relaxed">
              {{
                is404
                  ? 'The page you are looking for does not exist or has been moved.'
                  : error?.message ||
                    error?.statusText ||
                    'An unexpected error occurred while processing your request.'
              }}
            </p>
          </div>

          <div class="flex items-center gap-3 mt-2">
            <UButton
              color="primary"
              icon="i-lucide-home"
              label="Return to Safety"
              class="cursor-pointer"
              @click="handleError"
            />
          </div>
        </div>
      </UCard>
    </div>
  </UApp>
</template>
