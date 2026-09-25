<script setup lang="ts">
import { useSessionManagement } from '../composables/use-session-management.composable';

const { revokingSessions, onRevokeOtherSessions } = useSessionManagement();
const { ts } = useI18nShorter('security.sessions');
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-laptop" class="size-5 text-primary" />
        <h2 class="font-semibold text-base">{{ ts('title') }}</h2>
      </div>
    </template>

    <div class="flex flex-col gap-4 text-sm">
      <p class="text-muted">
        {{ ts('description') }}
      </p>

      <div class="p-3 rounded-lg border border-default bg-muted/20 text-xs flex flex-col gap-1.5">
        <div class="flex items-center gap-1.5 font-medium text-foreground">
          <UIcon name="i-lucide-shield-check" class="size-4 text-success" />
          {{ ts('guardTitle') }}
        </div>
        <p class="text-muted">
          {{ ts('guardDesc') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 pt-2">
        <UButton
          color="warning"
          variant="subtle"
          icon="i-lucide-power"
          :label="ts('revokeAllBtn')"
          class="cursor-pointer"
          :loading="revokingSessions"
          @click="onRevokeOtherSessions"
        />
      </div>
    </div>
  </UCard>
</template>
