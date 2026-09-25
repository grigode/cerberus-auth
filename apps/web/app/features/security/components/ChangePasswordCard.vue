<script setup lang="ts">
import { usePasswordManagement } from '../composables/use-password-management.composable';

const {
  currentPassword,
  newPassword,
  confirmPassword,
  passwordLoading,
  onChangePassword,
} = usePasswordManagement();

const { ts } = useI18nShorter('security.password');
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-lock" class="size-5 text-primary" />
        <h2 class="font-semibold text-base">{{ ts('title') }}</h2>
      </div>
    </template>

    <form class="flex flex-col gap-3 text-sm" @submit.prevent="onChangePassword">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-muted">{{ ts('currentLabel') }}</label>
        <UInput
          v-model="currentPassword"
          type="password"
          placeholder="••••••••"
          size="sm"
          required
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-muted">{{ ts('newLabel') }}</label>
        <UInput
          v-model="newPassword"
          type="password"
          placeholder="••••••••"
          size="sm"
          required
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-muted">{{ ts('confirmLabel') }}</label>
        <UInput
          v-model="confirmPassword"
          type="password"
          placeholder="••••••••"
          size="sm"
          required
        />
      </div>

      <div class="pt-2">
        <UButton
          type="submit"
          color="primary"
          size="sm"
          :label="ts('submitBtn')"
          class="cursor-pointer"
          :loading="passwordLoading"
        />
      </div>
    </form>
  </UCard>
</template>
