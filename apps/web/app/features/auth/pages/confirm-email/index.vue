<script setup lang="ts">
import AuthStateCard from '~/features/auth/components/AuthStateCard.vue';
import { useConfirmEmail } from './confirm-email.composable';

const { ts: tsHead } = useI18nShorter('auth.confirmEmail.head');
const { ts } = useI18nShorter('auth.confirmEmail');
const { ts: tsResend } = useI18nShorter('auth.confirmEmail.resend');

const { status, resending, resendState, resendSchema, onResend } =
  useConfirmEmail();

const stateIcon = computed(
  () =>
    ({
      verifying: 'i-lucide-loader-circle',
      success: 'i-lucide-circle-check-big',
      expired: 'i-lucide-mail-warning',
      error: 'i-lucide-circle-alert',
    })[status.value],
);

const stateVariant = computed(() => {
  if (status.value === 'verifying') return 'primary';
  if (status.value === 'success') return 'success';
  return 'error';
});

useSeoMeta({ title: tsHead('title') });
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4 w-full">
    <UPageCard class="w-full max-w-lg">
      <AuthStateCard
        :icon="stateIcon"
        :variant="stateVariant"
        :spin="status === 'verifying'"
        :title="ts(`${status}.title`)"
        :description="ts(`${status}.description`)"
      >
        <UButton
          v-if="status === 'success'"
          to="/login"
          block
          class="cursor-pointer"
        >
          {{ ts("success.action") }}
        </UButton>

        <template v-if="status === 'expired' || status === 'error'">
          <USeparator />

          <UForm
            :schema="resendSchema"
            :state="resendState"
            class="flex flex-col gap-3 w-full text-left"
            @submit="onResend"
          >
            <p class="text-sm font-medium text-center">
              {{ tsResend("title") }}
            </p>
            <UFormField name="email" :label="tsResend('inputs.email.label')">
              <UInput
                v-model="resendState.email"
                type="email"
                :placeholder="tsResend('inputs.email.placeholder')"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="submit"
              :loading="resending"
              block
              class="cursor-pointer"
            >
              {{ tsResend("submit") }}
            </UButton>
          </UForm>
        </template>

        <USeparator />

        <p>
          {{ ts("footer.question") }}
          <NuxtLink to="/login" class="underline">
            {{ ts("footer.link") }}
          </NuxtLink>
        </p>
      </AuthStateCard>
    </UPageCard>
  </div>
</template>
