<script setup lang="ts"></script>

<template>
  <UMain class="flex justify-center items-center py-12 min-h-screen">
    <NuxtErrorBoundary>
      <slot />

      <template #error="{ error, clearError }">
        <AppErrorBoundary :error="error" :clear-error="clearError" />
      </template>
    </NuxtErrorBoundary>
  </UMain>
</template>
