<script setup lang="ts">
interface Props {
  error: { message?: string; stack?: string } | null;
  clearError: () => void;
}

const props = defineProps<Props>();

const errorMessage = computed(() => {
  if (!props.error) return 'An unexpected error occurred.';
  return props.error.message || 'An unexpected runtime error occurred.';
});
</script>

<template>
  <div class="flex items-center justify-center p-6 w-full min-h-[300px]">
    <UCard class="max-w-md w-full border-error/20 bg-error/5 shadow-lg">
      <div class="flex flex-col items-center text-center gap-4 py-4">
        <div class="rounded-full bg-error/10 p-3 text-error">
          <UIcon name="i-lucide-alert-triangle" class="size-8" />
        </div>

        <div class="flex flex-col gap-1.5">
          <h3 class="text-base font-semibold text-foreground">
            Something went wrong
          </h3>
          <p class="text-xs text-muted leading-relaxed">
            {{ errorMessage }}
          </p>
        </div>

        <div class="flex gap-2 mt-2 w-full justify-center">
          <UButton
            color="neutral"
            variant="outline"
            label="Try Again"
            icon="i-lucide-rotate-ccw"
            class="cursor-pointer"
            @click="clearError"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
