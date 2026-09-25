<script setup lang="ts">
import { useModalModel } from '~/composables/use-modal-model.composable';

const props = defineProps<{
  open: boolean;
  backupCodes: string[];
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'copyAll'): void;
}>();

const { ts } = useI18nShorter('security.mfa.backupCodes');
const { isOpen, closeModal } = useModalModel(props, emit);
</script>

<template>
  <UModal v-model:open="isOpen" :title="ts('title')">
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="text-sm text-muted">
          {{ ts('description') }}
        </p>

        <div class="grid grid-cols-2 gap-2 p-4 rounded-xl border border-default bg-muted/20">
          <div
            v-for="(c, idx) in backupCodes"
            :key="idx"
            class="font-mono text-xs text-center py-1.5 px-2 bg-background rounded border border-default/50"
          >
            {{ c }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-copy"
          :label="ts('copyBtn')"
          class="cursor-pointer"
          @click="emit('copyAll')"
        />
        <UButton
          color="primary"
          :label="ts('savedBtn')"
          class="cursor-pointer"
          @click="closeModal"
        />
      </div>
    </template>
  </UModal>
</template>
