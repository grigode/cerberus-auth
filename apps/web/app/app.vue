<script setup lang="ts">
const { locale } = useI18n();

useHead({
  htmlAttrs: { lang: locale.value },
  title: 'Arachne',
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
