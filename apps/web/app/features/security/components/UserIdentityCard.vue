<script setup lang="ts">
const { user } = useAuth();
const { ts } = useI18nShorter('security.identity');

const fullName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
);
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-user" class="size-5 text-primary" />
        <h2 class="font-semibold text-base">{{ ts('title') }}</h2>
      </div>
    </template>

    <div class="flex flex-col gap-3 text-sm">
      <div class="flex justify-between py-1.5 border-b border-default">
        <span class="text-muted">{{ ts('userId') }}</span>
        <span class="font-mono text-xs">{{ user?.id }}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-default">
        <span class="text-muted">{{ ts('email') }}</span>
        <span class="font-medium">{{ user?.email }}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-default">
        <span class="text-muted">{{ ts('fullName') }}</span>
        <span class="font-medium">{{ fullName }}</span>
      </div>
      <div class="flex justify-between py-1.5 border-b border-default">
        <span class="text-muted">{{ ts('role') }}</span>
        <span class="font-medium font-mono text-xs">{{ user?.role || 'USER' }}</span>
      </div>
    </div>
  </UCard>
</template>
