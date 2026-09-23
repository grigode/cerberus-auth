<script setup lang="ts">
const { isAuthenticated } = useAuth();

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/dashboard');
  } else {
    navigateTo('/login');
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
  </div>
</template>
