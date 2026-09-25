<script setup lang="ts">
import Logo from '~/assets/icons/logo.vue';
import { useRegister } from './register.composable';

const { ts: tsHead } = useI18nShorter('auth.register.head');
const { ts } = useI18nShorter('auth.register.form');
const { loading, fields, providers, schema, onSubmit } = useRegister();

useSeoMeta({ title: tsHead('title') });
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <UAuthForm
        :description="ts('description')"
        :providers="providers"
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

        <template #separator>
          <USeparator :label="ts('separator')" />
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
