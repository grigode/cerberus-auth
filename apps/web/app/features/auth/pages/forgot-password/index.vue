<script setup lang="ts">
import Logo from '~/assets/icons/logo.vue';
import AuthStateCard from '~/features/auth/components/AuthStateCard.vue';
import { useForgotPassword } from './forgot-password.composable';

const { ts: tsHead } = useI18nShorter('auth.forgotPassword.head');
const { ts } = useI18nShorter('auth.forgotPassword.form');
const { ts: tsSuccess } = useI18nShorter('auth.forgotPassword.success');
const { loading, submitted, fields, schema, onSubmit } = useForgotPassword();

useSeoMeta({ title: tsHead('title') });
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <AuthStateCard
        v-if="submitted"
        icon="i-lucide-mail-check"
        :title="tsSuccess('title')"
        :description="tsSuccess('description')"
      >
        <USeparator />

        <p>
          {{ tsSuccess("footer.question") }}
          <NuxtLink to="/login" class="underline">
            {{ tsSuccess("footer.link") }}
          </NuxtLink>
        </p>
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
