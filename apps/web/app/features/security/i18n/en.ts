export const en = {
  header: {
    welcome: 'Welcome, {name}',
    subtitle: 'Your Cerberus security and authentication portal.',
    signOut: 'Sign Out',
  },
  identity: {
    title: 'User Identity',
    userId: 'User ID',
    email: 'Email',
    fullName: 'Full Name',
    role: 'Role',
  },
  mfa: {
    title: 'Two-Factor Authentication',
    description:
      'Protect your account with a time-based one-time password (TOTP) from Google Authenticator, 1Password, or Authy.',
    enabled: 'Enabled',
    disabled: 'Disabled',
    enableBtn: 'Enable 2FA',
    disableBtn: 'Disable 2FA',
    backupCodesBtn: 'Backup Codes',
    setup: {
      title: 'Setup Two-Factor Authentication',
      loading: 'Generating security key and QR code...',
      scanPrompt:
        'Scan this QR code with your authenticator app (Google Authenticator, 1Password, Authy).',
      manualKey: 'Manual entry secret key:',
      codeLabel: 'Verification Code',
      verifyBtn: 'Verify & Activate',
      cancelBtn: 'Cancel',
      copiedSecret: 'Secret copied to clipboard.',
      success: 'Two-Factor Authentication enabled successfully!',
      error: 'Invalid verification code. Please check your authenticator app.',
    },
    disable: {
      title: 'Disable Two-Factor Authentication',
      warning:
        'Disabling 2FA makes your account more vulnerable. Enter the 6-digit code from your authenticator app to confirm deactivation.',
      codeLabel: 'Authenticator Code',
      confirmBtn: 'Disable 2FA',
      cancelBtn: 'Cancel',
      success: 'Two-Factor Authentication has been disabled.',
      error: 'Invalid verification code. Could not disable 2FA.',
    },
    backupCodes: {
      title: 'Emergency Recovery Backup Codes',
      description:
        'Save these single-use emergency recovery codes in a secure location. Each code can only be used once if you lose access to your device.',
      copyBtn: 'Copy All Codes',
      copied: 'Backup codes copied to clipboard.',
      savedBtn: 'I Have Saved These Codes',
      regenerated: 'New emergency backup codes generated.',
      error: 'Could not generate backup codes.',
    },
  },
  password: {
    title: 'Change Password',
    currentLabel: 'Current Password',
    newLabel: 'New Password',
    confirmLabel: 'Confirm New Password',
    submitBtn: 'Update Password',
    success: 'Password updated successfully. Other sessions revoked.',
    errors: {
      empty: 'Please fill in both current and new password.',
      minLength: 'New password must be at least 12 characters long.',
      mismatch: 'New password and confirmation do not match.',
      failed: 'Failed to change password. Please check your current password.',
    },
  },
  sessions: {
    title: 'Session & Device Security',
    description:
      'Your session is secured using HTTP-only, SameSite cookies with automated rotation.',
    guardTitle: 'Active Session Guard',
    guardDesc:
      'Access tokens are automatically refreshed in the background without interrupting your workflow.',
    revokeAllBtn: 'Revoke All Sessions',
    revokeSuccess: 'All sessions revoked. Redirecting to login.',
    revokeError: 'Could not revoke all sessions.',
  },
};
