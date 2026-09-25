<script setup lang="ts">
import { useModalModel } from '~/composables/use-modal-model.composable';

const props = defineProps<{
  open: boolean;
  actionLoading: boolean;
  modelValueDisableCode: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'update:modelValueDisableCode', val: string): void;
  (e: 'confirm'): void;
}>();

const { ts } = useI18nShorter('security.mfa.disable');
const { isOpen, closeModal } = useModalModel(props, emit);

const code = computed({
  get: () => props.modelValueDisableCode,
  set: (val) => emit('update:modelValueDisableCode', val),
});
</script>

<template>
  <UModal v-model:open="isOpen" :title="ts('title')">
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="text-sm text-muted">
          {{ ts('warning') }}
        </p>
        <div class="flex flex-col gap-1">
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
          color="error"
          :label="ts('confirmBtn')"
          class="cursor-pointer"
          :loading="actionLoading"
          :disabled="!code || code.length < 6"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
