<script setup lang="ts">
import BackupCodesModal from '~/features/security/components/BackupCodesModal.vue';
import ChangePasswordCard from '~/features/security/components/ChangePasswordCard.vue';
import MfaDisableModal from '~/features/security/components/MfaDisableModal.vue';
import MfaSecurityCard from '~/features/security/components/MfaSecurityCard.vue';
import MfaSetupModal from '~/features/security/components/MfaSetupModal.vue';
import SessionSecurityCard from '~/features/security/components/SessionSecurityCard.vue';
import UserIdentityCard from '~/features/security/components/UserIdentityCard.vue';
import { useMfaManagement } from '~/features/security/composables/use-mfa-management.composable';

const { user, logout } = useAuth();
const { ts } = useI18nShorter('security.header');

useSeoMeta({ title: 'Security & Dashboard - Cerberus' });

const fullName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
);

const {
  isSetupModalOpen,
  isDisableModalOpen,
  isBackupCodesModalOpen,
  setupLoading,
  setupData,
  verificationCode,
  disableCode,
  actionLoading,
  backupCodes,
  openSetupMfa,
  confirmEnableMfa,
  confirmDisableMfa,
  regenerateBackupCodes,
  copySecret,
  copyAllBackupCodes,
} = useMfaManagement();
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
    <!-- Header Greeting -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-default">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">
            {{ ts('welcome', { name: fullName }) }}
          </h1>
          <UBadge
            v-if="user?.role"
            :color="user.role === 'SUPERADMIN' ? 'error' : user.role === 'ADMIN' ? 'warning' : 'primary'"
            variant="subtle"
            class="font-mono text-xs uppercase"
          >
            {{ user.role }}
          </UBadge>
        </div>
        <p class="text-sm text-muted">
          {{ ts('subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-log-out"
          :label="ts('signOut')"
          class="cursor-pointer"
          @click="logout"
        />
      </div>
    </div>

    <!-- Grid of Security Modules -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- 1. Profile & Identity -->
      <UserIdentityCard />

      <!-- 2. Two-Factor Authentication (MFA) -->
      <MfaSecurityCard
        :action-loading="actionLoading"
        @setup="openSetupMfa"
        @disable="isDisableModalOpen = true"
        @backup-codes="regenerateBackupCodes(true)"
      />

      <!-- 3. Change Password -->
      <ChangePasswordCard />

      <!-- 4. Session & Device Security -->
      <SessionSecurityCard />
    </div>

    <!-- Modals -->
    <MfaSetupModal
      v-model:open="isSetupModalOpen"
      v-model:model-value-verification-code="verificationCode"
      :loading="setupLoading"
      :setup-data="setupData"
      :action-loading="actionLoading"
      @confirm="confirmEnableMfa"
      @copy-secret="copySecret"
    />

    <MfaDisableModal
      v-model:open="isDisableModalOpen"
      v-model:model-value-disable-code="disableCode"
      :action-loading="actionLoading"
      @confirm="confirmDisableMfa"
    />

    <BackupCodesModal
      v-model:open="isBackupCodesModalOpen"
      :backup-codes="backupCodes"
      @copy-all="copyAllBackupCodes"
    />
  </div>
</template>
