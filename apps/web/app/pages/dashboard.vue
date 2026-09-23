<script setup lang="ts">
import { useAuth } from '~/composables/use-auth.composable';
import { useAuthFeedback } from '~/composables/use-auth-feedback.composable';

const { user, fetchSession, logout, logoutAll } = useAuth();
const { notifySuccess, notifyError, notifyApiError } = useAuthFeedback();

useSeoMeta({ title: 'Security & Dashboard - Cerberus' });

const fullName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
);

// ----------------------------------------------------
// 2FA / MFA Setup & Management State
// ----------------------------------------------------
const isSetupModalOpen = ref(false);
const isDisableModalOpen = ref(false);
const isBackupCodesModalOpen = ref(false);

const setupLoading = ref(false);
const setupData = ref<{ secret: string; qrCodeUrl: string } | null>(null);
const verificationCode = ref('');
const disableCode = ref('');
const actionLoading = ref(false);

const backupCodes = ref<string[]>([]);

// Start MFA setup: fetches QR and secret from backend
const openSetupMfa = async () => {
  setupLoading.value = true;
  setupData.value = null;
  verificationCode.value = '';
  isSetupModalOpen.value = true;

  try {
    const data = await $fetch<{ secret: string; qrCodeUrl: string }>(
      '/iam/mfa/setup',
      {
        baseURL: useRuntimeConfig().public.apiBaseUrl,
        credentials: 'include',
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );
    setupData.value = data;
  } catch (err: unknown) {
    notifyError('Could not initialize 2FA setup. Please try again.');
    isSetupModalOpen.value = false;
  } finally {
    setupLoading.value = false;
  }
};

// Confirm and activate 2FA
const confirmEnableMfa = async () => {
  if (!setupData.value || !verificationCode.value) return;
  actionLoading.value = true;

  try {
    await $fetch('/iam/mfa/enable', {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: {
        secret: setupData.value.secret,
        code: verificationCode.value.trim(),
      },
    });

    notifySuccess('Two-Factor Authentication enabled successfully!');
    isSetupModalOpen.value = false;
    await fetchSession();

    // Fetch initial backup codes
    await regenerateBackupCodes(false);
  } catch (err: unknown) {
    notifyError(
      'Invalid verification code. Please check your authenticator app.',
    );
  } finally {
    actionLoading.value = false;
  }
};

// Disable 2FA
const confirmDisableMfa = async () => {
  if (!disableCode.value) return;
  actionLoading.value = true;

  try {
    await $fetch('/iam/mfa/disable', {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: {
        code: disableCode.value.trim(),
      },
    });

    notifySuccess('Two-Factor Authentication has been disabled.');
    isDisableModalOpen.value = false;
    disableCode.value = '';
    await fetchSession();
  } catch (err: unknown) {
    notifyError('Invalid verification code. Could not disable 2FA.');
  } finally {
    actionLoading.value = false;
  }
};

// Regenerate backup codes
const regenerateBackupCodes = async (notify = true) => {
  actionLoading.value = true;
  try {
    const res = await $fetch<{ backupCodes: string[] }>(
      '/iam/mfa/backup-codes/regenerate',
      {
        baseURL: useRuntimeConfig().public.apiBaseUrl,
        credentials: 'include',
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );
    backupCodes.value = res.backupCodes || [];
    isBackupCodesModalOpen.value = true;
    if (notify) {
      notifySuccess('New emergency backup codes generated.');
    }
  } catch (err: unknown) {
    notifyError('Could not generate backup codes.');
  } finally {
    actionLoading.value = false;
  }
};

const copySecret = () => {
  if (!setupData.value?.secret) return;
  navigator.clipboard.writeText(setupData.value.secret);
  notifySuccess('Secret copied to clipboard.');
};

const copyAllBackupCodes = () => {
  if (!backupCodes.value.length) return;
  navigator.clipboard.writeText(backupCodes.value.join('\n'));
  notifySuccess('Backup codes copied to clipboard.');
};

// ----------------------------------------------------
// Password Change State
// ----------------------------------------------------
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordLoading = ref(false);

const onChangePassword = async () => {
  if (!currentPassword.value || !newPassword.value) {
    notifyError('Please fill in both current and new password.');
    return;
  }
  if (newPassword.value.length < 8) {
    notifyError('New password must be at least 8 characters long.');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    notifyError('New password and confirmation do not match.');
    return;
  }

  passwordLoading.value = true;
  try {
    await $fetch('/iam/auth/change-password', {
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    });

    notifySuccess('Password updated successfully. Other sessions revoked.');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err: unknown) {
    notifyError(
      'Failed to change password. Please check your current password.',
    );
  } finally {
    passwordLoading.value = false;
  }
};

// ----------------------------------------------------
// Session Revocation
// ----------------------------------------------------
const revokingSessions = ref(false);
const onRevokeOtherSessions = async () => {
  revokingSessions.value = true;
  try {
    await logoutAll();
    notifySuccess('All sessions revoked. Redirecting to login.');
  } catch {
    notifyError('Could not revoke all sessions.');
  } finally {
    revokingSessions.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
    <!-- Header Greeting -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-default">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">
            Welcome, {{ fullName }}
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
          Your Cerberus security and authentication portal.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-log-out"
          label="Sign Out"
          class="cursor-pointer"
          @click="logout"
        />
      </div>
    </div>

    <!-- Grid of Security Modules -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- 1. Profile & Identity -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="size-5 text-primary" />
            <h2 class="font-semibold text-base">User Identity</h2>
          </div>
        </template>

        <div class="flex flex-col gap-3 text-sm">
          <div class="flex justify-between py-1.5 border-b border-default">
            <span class="text-muted">User ID</span>
            <span class="font-mono text-xs">{{ user?.id }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-default">
            <span class="text-muted">Email</span>
            <span class="font-medium">{{ user?.email }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-default">
            <span class="text-muted">Full Name</span>
            <span class="font-medium">{{ fullName }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-default">
            <span class="text-muted">Role</span>
            <span class="font-medium font-mono text-xs">{{ user?.role || 'USER' }}</span>
          </div>
        </div>
      </UCard>

      <!-- 2. Two-Factor Authentication (MFA) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <UIcon
                :name="user?.isMfaEnabled ? 'i-lucide-shield-check' : 'i-lucide-shield-alert'"
                :class="user?.isMfaEnabled ? 'text-success' : 'text-warning'"
                class="size-5"
              />
              <h2 class="font-semibold text-base">Two-Factor Authentication</h2>
            </div>
            <UBadge
              :color="user?.isMfaEnabled ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ user?.isMfaEnabled ? 'Enabled' : 'Disabled' }}
            </UBadge>
          </div>
        </template>

        <div class="flex flex-col gap-4 text-sm">
          <p class="text-muted">
            Protect your account with a time-based one-time password (TOTP) from Google Authenticator, 1Password, or Authy.
          </p>

          <div v-if="!user?.isMfaEnabled" class="pt-2">
            <UButton
              color="primary"
              icon="i-lucide-shield-plus"
              label="Enable 2FA"
              class="cursor-pointer"
              @click="openSetupMfa"
            />
          </div>

          <div v-else class="flex flex-wrap gap-2 pt-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-key"
              label="Backup Codes"
              class="cursor-pointer"
              :loading="actionLoading"
              @click="regenerateBackupCodes(true)"
            />
            <UButton
              color="error"
              variant="subtle"
              icon="i-lucide-shield-off"
              label="Disable 2FA"
              class="cursor-pointer"
              @click="isDisableModalOpen = true"
            />
          </div>
        </div>
      </UCard>

      <!-- 3. Change Password -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="size-5 text-primary" />
            <h2 class="font-semibold text-base">Change Password</h2>
          </div>
        </template>

        <form class="flex flex-col gap-3 text-sm" @submit.prevent="onChangePassword">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-muted">Current Password</label>
            <UInput
              v-model="currentPassword"
              type="password"
              placeholder="••••••••"
              size="sm"
              required
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-muted">New Password</label>
            <UInput
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              size="sm"
              required
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-muted">Confirm New Password</label>
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              size="sm"
              required
            />
          </div>

          <div class="pt-2">
            <UButton
              type="submit"
              color="primary"
              size="sm"
              label="Update Password"
              class="cursor-pointer"
              :loading="passwordLoading"
            />
          </div>
        </form>
      </UCard>

      <!-- 4. Session & Device Security -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-laptop" class="size-5 text-primary" />
            <h2 class="font-semibold text-base">Session & Device Security</h2>
          </div>
        </template>

        <div class="flex flex-col gap-4 text-sm">
          <p class="text-muted">
            Your session is secured using HTTP-only, SameSite cookies with automated rotation.
          </p>

          <div class="p-3 rounded-lg border border-default bg-muted/20 text-xs flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5 font-medium text-foreground">
              <UIcon name="i-lucide-shield-check" class="size-4 text-success" />
              Active Session Guard
            </div>
            <p class="text-muted">
              Access tokens are automatically refreshed in the background without interrupting your workflow.
            </p>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            <UButton
              color="warning"
              variant="subtle"
              icon="i-lucide-power"
              label="Revoke All Sessions"
              class="cursor-pointer"
              :loading="revokingSessions"
              @click="onRevokeOtherSessions"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- MFA Setup Modal -->
    <UModal v-model:open="isSetupModalOpen" title="Setup Two-Factor Authentication">
      <template #body>
        <div v-if="setupLoading" class="flex flex-col items-center justify-center p-8 gap-3">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
          <p class="text-sm text-muted">Generating security key and QR code...</p>
        </div>

        <div v-else-if="setupData" class="flex flex-col items-center gap-4 text-center">
          <p class="text-sm text-muted">
            Scan this QR code with your authenticator app (Google Authenticator, 1Password, Authy).
          </p>

          <div class="p-2 border border-default rounded-xl bg-white">
            <img
              :src="setupData.qrCodeUrl"
              alt="2FA QR Code"
              class="size-48"
            />
          </div>

          <div class="flex flex-col items-center gap-1 w-full max-w-xs">
            <span class="text-xs text-muted">Manual entry secret key:</span>
            <div class="flex items-center gap-2 p-2 rounded border border-default bg-muted/30 w-full justify-between">
              <span class="font-mono text-xs tracking-wider select-all">{{ setupData.secret }}</span>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                size="xs"
                @click="copySecret"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 w-full max-w-xs text-left pt-2">
            <label class="text-xs font-medium">Verification Code</label>
            <UInput
              v-model="verificationCode"
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
            label="Cancel"
            class="cursor-pointer"
            @click="isSetupModalOpen = false"
          />
          <UButton
            color="primary"
            label="Verify & Activate"
            class="cursor-pointer"
            :loading="actionLoading"
            :disabled="!verificationCode || verificationCode.length < 6"
            @click="confirmEnableMfa"
          />
        </div>
      </template>
    </UModal>

    <!-- MFA Disable Modal -->
    <UModal v-model:open="isDisableModalOpen" title="Disable Two-Factor Authentication">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted">
            Disabling 2FA makes your account more vulnerable. Enter the 6-digit code from your authenticator app to confirm deactivation.
          </p>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium">Authenticator Code</label>
            <UInput
              v-model="disableCode"
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
            label="Cancel"
            class="cursor-pointer"
            @click="isDisableModalOpen = false"
          />
          <UButton
            color="error"
            label="Disable 2FA"
            class="cursor-pointer"
            :loading="actionLoading"
            :disabled="!disableCode || disableCode.length < 6"
            @click="confirmDisableMfa"
          />
        </div>
      </template>
    </UModal>

    <!-- Backup Codes Modal -->
    <UModal v-model:open="isBackupCodesModalOpen" title="Emergency Recovery Backup Codes">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-muted">
            Save these single-use emergency recovery codes in a secure location. Each code can only be used once if you lose access to your device.
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
            label="Copy All Codes"
            class="cursor-pointer"
            @click="copyAllBackupCodes"
          />
          <UButton
            color="primary"
            label="I Have Saved These Codes"
            class="cursor-pointer"
            @click="isBackupCodesModalOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
