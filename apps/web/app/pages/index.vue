<script setup lang="ts">
const { isAuthenticated } = useAuth();

await navigateTo(isAuthenticated.value ? '/dashboard' : '/login', {
  replace: true,
  redirectCode: 302,
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
  </div>
</template>
