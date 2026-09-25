<script setup lang="ts">
import type { MfaSetupResponseDto } from '~/types/contracts';
import { useModalModel } from '~/composables/use-modal-model.composable';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  setupData: MfaSetupResponseDto | null;
  actionLoading: boolean;
  modelValueVerificationCode: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'update:modelValueVerificationCode', val: string): void;
  (e: 'confirm'): void;
  (e: 'copySecret'): void;
}>();

const { ts } = useI18nShorter('security.mfa.setup');
const { isOpen, closeModal } = useModalModel(props, emit);

const code = computed({
  get: () => props.modelValueVerificationCode,
  set: (val) => emit('update:modelValueVerificationCode', val),
});
</script>

<template>
  <UModal v-model:open="isOpen" :title="ts('title')">
    <template #body>
      <div v-if="loading" class="flex flex-col items-center justify-center p-8 gap-3">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
        <p class="text-sm text-muted">{{ ts('loading') }}</p>
      </div>

      <div v-else-if="setupData" class="flex flex-col items-center gap-4 text-center">
        <p class="text-sm text-muted">
          {{ ts('scanPrompt') }}
        </p>

        <div class="p-2 border border-default rounded-xl bg-white">
          <img
            :src="setupData.qrCodeUrl"
            alt="2FA QR Code"
            class="size-48"
          />
        </div>

        <div class="flex flex-col items-center gap-1 w-full max-w-xs">
          <span class="text-xs text-muted">{{ ts('manualKey') }}</span>
          <div class="flex items-center gap-2 p-2 rounded border border-default bg-muted/30 w-full justify-between">
            <span class="font-mono text-xs tracking-wider select-all">{{ setupData.secret }}</span>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-copy"
              size="xs"
              @click="emit('copySecret')"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-xs text-left pt-2">
          <label class="text-xs font-medium">{{ ts('codeLabel') }}</label>
          <UInput
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="123456"
            size="lg"
            class="text-center font-mono tracking-widest text-lg"
            autofocus
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="neutral"
          variant="ghost"
          :label="ts('cancelBtn')"
          class="cursor-pointer"
          @click="closeModal"
        />
        <UButton
          color="primary"
          :label="ts('verifyBtn')"
          class="cursor-pointer"
          :loading="actionLoading"
          :disabled="!code || code.length < 6"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
