<script setup lang="ts">
defineProps<{
  actionLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'setup'): void;
  (e: 'disable'): void;
  (e: 'backupCodes'): void;
}>();

const { user } = useAuth();
const { ts } = useI18nShorter('security.mfa');
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <UIcon
            :name="user?.isMfaEnabled ? 'i-lucide-shield-check' : 'i-lucide-shield-alert'"
            :class="user?.isMfaEnabled ? 'text-success' : 'text-warning'"
            class="size-5"
          />
          <h2 class="font-semibold text-base">{{ ts('title') }}</h2>
        </div>
        <UBadge
          :color="user?.isMfaEnabled ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ user?.isMfaEnabled ? ts('enabled') : ts('disabled') }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-col gap-4 text-sm">
      <p class="text-muted">
        {{ ts('description') }}
      </p>

      <div v-if="!user?.isMfaEnabled" class="pt-2">
        <UButton
          color="primary"
          icon="i-lucide-shield-plus"
          :label="ts('enableBtn')"
          class="cursor-pointer"
          @click="emit('setup')"
        />
      </div>

      <div v-else class="flex flex-wrap gap-2 pt-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-key"
          :label="ts('backupCodesBtn')"
          class="cursor-pointer"
          :loading="actionLoading"
          @click="emit('backupCodes')"
        />
        <UButton
          color="error"
          variant="subtle"
          icon="i-lucide-shield-off"
          :label="ts('disableBtn')"
          class="cursor-pointer"
          @click="emit('disable')"
        />
      </div>
    </div>
  </UCard>
</template>
