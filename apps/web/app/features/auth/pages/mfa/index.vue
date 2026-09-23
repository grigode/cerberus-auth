<script setup lang="ts">
import Logo from '~/assets/icons/logo.vue';
import { useMfa } from './mfa.composable';

const { ts: tsHead } = useI18nShorter('auth.mfa.head');
const { ts } = useI18nShorter('auth.mfa.form');
const { loading, useBackupCode, code, toggleBackupCode, onSubmit } = useMfa();

useSeoMeta({ title: tsHead('title') });

const handleInput = () => {
  if (!useBackupCode.value && code.value.length === 6) {
    onSubmit();
  }
};
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <div class="flex flex-col items-center text-center gap-4">
        <div class="flex justify-center items-center">
          <Logo class="fill-primary size-20" />
        </div>

        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-bold">
            {{ ts("title") }}
          </h1>
          <p class="text-sm text-muted">
            {{ useBackupCode ? ts("backupDescription") : ts("description") }}
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="flex flex-col gap-4 w-full mt-2">
          <div v-if="!useBackupCode" class="flex flex-col items-center gap-2">
            <label class="text-sm font-medium self-start">
              {{ ts("inputs.code.label") }}
            </label>
            <UInput
              v-model="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              :placeholder="ts('inputs.code.placeholder')"
              size="xl"
              class="w-full text-center tracking-[0.5em] font-mono text-lg"
              :disabled="loading"
              autofocus
              @input="handleInput"
            />
          </div>

          <div v-else class="flex flex-col gap-2 text-left">
            <label class="text-sm font-medium">
              {{ ts("inputs.backupCode.label") }}
            </label>
            <UInput
              v-model="code"
              type="text"
              :placeholder="ts('inputs.backupCode.placeholder')"
              size="lg"
              class="w-full font-mono"
              :disabled="loading"
              autofocus
            />
          </div>

          <UButton
            type="submit"
            color="primary"
            block
            size="lg"
            :loading="loading"
            class="cursor-pointer mt-2"
          >
            {{ ts("submit") }}
          </UButton>

          <button
            type="button"
            class="text-xs text-primary hover:underline cursor-pointer py-1"
            @click="toggleBackupCode"
          >
            {{ useBackupCode ? ts("toggle.useTotp") : ts("toggle.useBackup") }}
          </button>
        </form>

        <USeparator class="my-2" />

        <p class="text-sm text-muted">
          {{ ts("footer.question") }}
          <NuxtLink to="/login" class="underline text-foreground">
            {{ ts("footer.link") }}
          </NuxtLink>
        </p>
      </div>
    </UPageCard>
  </div>
</template>
