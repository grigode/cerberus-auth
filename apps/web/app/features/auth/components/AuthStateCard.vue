<script setup lang="ts">
import Logo from '~/assets/icons/logo.vue';

// Shared "state screen" for auth flows: the centered Logo + status icon +
// title + description block that every non-form auth view repeats (email
// pending, verifying, success, invalid/expired). Callers drop any actions,
// separators or footer links into the default slot.
const props = withDefaults(
  defineProps<{
    icon: string;
    title: string;
    description: string;
    variant?: 'primary' | 'success' | 'error';
    spin?: boolean;
  }>(),
  { variant: 'primary', spin: false },
);

const iconColor = computed(
  () =>
    ({
      primary: 'text-primary',
      success: 'text-success',
      error: 'text-error',
    })[props.variant],
);
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <Logo class="fill-primary size-20" />

    <UIcon :name="icon" :class="[iconColor, 'size-10', spin && 'animate-spin']" />

    <h1 class="text-xl font-semibold">{{ title }}</h1>

    <p>{{ description }}</p>

    <slot />
  </div>
</template>
