<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <picture class="contents">
    <source srcset="/logo.webp" type="image/webp" />
    <img
      src="/logo.png"
      alt="Cerberus"
      class="object-contain inline-block select-none pointer-events-none"
      v-bind="$attrs"
    />
  </picture>
</template>
