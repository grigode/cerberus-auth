<script setup lang="ts">
import Logo from '~/assets/icons/logo.vue';
import AuthStateCard from '~/features/auth/components/AuthStateCard.vue';
import { useResetPassword } from './reset-password.composable';

const { ts: tsHead } = useI18nShorter('auth.resetPassword.head');
const { ts } = useI18nShorter('auth.resetPassword.form');
const { ts: tsSuccess } = useI18nShorter('auth.resetPassword.success');
const { ts: tsInvalid } = useI18nShorter('auth.resetPassword.invalid');
const { loading, submitted, invalidToken, fields, schema, onSubmit } =
  useResetPassword();

useSeoMeta({ title: tsHead('title') });
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <AuthStateCard
        v-if="invalidToken"
        icon="i-lucide-mail-warning"
        variant="error"
        :title="tsInvalid('title')"
        :description="tsInvalid('description')"
      >
        <UButton to="/forgot-password" block class="cursor-pointer">
          {{ tsInvalid("action") }}
        </UButton>

        <USeparator />

        <p>
          {{ tsInvalid("footer.question") }}
          <NuxtLink to="/login" class="underline">
            {{ tsInvalid("footer.link") }}
          </NuxtLink>
        </p>
      </AuthStateCard>

      <AuthStateCard
        v-else-if="submitted"
        icon="i-lucide-circle-check-big"
        variant="success"
        :title="tsSuccess('title')"
        :description="tsSuccess('description')"
      >
        <UButton to="/login" block class="cursor-pointer">
          {{ tsSuccess("action") }}
        </UButton>
      </AuthStateCard>

      <UAuthForm
        v-else
        :description="ts('description')"
        :fields="fields"
        :schema="schema"
        :submit="{
          label: ts('submit'),
          class: 'cursor-pointer',
        }"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #leading>
          <div class="flex justify-center items-center">
            <Logo class="fill-primary size-20" />
          </div>
        </template>

        <template #title>
          <h1>{{ ts("title") }}</h1>
        </template>

        <template #footer>
          <USeparator />

          <p class="mt-4">
            {{ ts("footer.question") }}
            <NuxtLink to="/login" class="underline">
              {{ ts("footer.link") }}
            </NuxtLink>
          </p>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
