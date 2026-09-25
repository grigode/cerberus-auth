export const es = {
  header: {
    welcome: 'Bienvenido, {name}',
    subtitle: 'Tu portal de seguridad y autenticación Cerberus.',
    signOut: 'Cerrar Sesión',
  },
  identity: {
    title: 'Identidad del Usuario',
    userId: 'ID de Usuario',
    email: 'Correo Electrónico',
    fullName: 'Nombre Completo',
    role: 'Rol',
  },
  mfa: {
    title: 'Autenticación en Dos Pasos (2FA)',
    description:
      'Protege tu cuenta con una contraseña de un solo uso basada en tiempo (TOTP) desde Google Authenticator, 1Password o Authy.',
    enabled: 'Activado',
    disabled: 'Desactivado',
    enableBtn: 'Activar 2FA',
    disableBtn: 'Desactivar 2FA',
    backupCodesBtn: 'Códigos de Respaldo',
    setup: {
      title: 'Configurar Autenticación en Dos Pasos',
      loading: 'Generando clave de seguridad y código QR...',
      scanPrompt:
        'Escanea este código QR con tu aplicación de autenticación (Google Authenticator, 1Password, Authy).',
      manualKey: 'Clave secreta para ingreso manual:',
      codeLabel: 'Código de Verificación',
      verifyBtn: 'Verificar y Activar',
      cancelBtn: 'Cancelar',
      copiedSecret: 'Clave secreta copiada al portapapeles.',
      success: '¡Autenticación en dos pasos activada exitosamente!',
      error:
        'Código de verificación inválido. Por favor verifica tu aplicación.',
    },
    disable: {
      title: 'Desactivar Autenticación en Dos Pasos',
      warning:
        'Desactivar 2FA hace que tu cuenta sea más vulnerable. Ingresa el código de 6 dígitos para confirmar la desactivación.',
      codeLabel: 'Código de Autenticación',
      confirmBtn: 'Desactivar 2FA',
      cancelBtn: 'Cancelar',
      success: 'La autenticación en dos pasos ha sido desactivada.',
      error: 'Código inválido. No se pudo desactivar 2FA.',
    },
    backupCodes: {
      title: 'Códigos de Respaldo de Emergencia',
      description:
        'Guarda estos códigos de recuperación de un solo uso en un lugar seguro. Cada código solo se puede usar una vez si pierdes acceso a tu dispositivo.',
      copyBtn: 'Copiar Todos los Códigos',
      copied: 'Códigos de respaldo copiados al portapapeles.',
      savedBtn: 'He Guardado Estos Códigos',
      regenerated: 'Nuevos códigos de respaldo generados.',
      error: 'No se pudieron generar los códigos de respaldo.',
    },
  },
  password: {
    title: 'Cambiar Contraseña',
    currentLabel: 'Contraseña Actual',
    newLabel: 'Nueva Contraseña',
    confirmLabel: 'Confirmar Nueva Contraseña',
    submitBtn: 'Actualizar Contraseña',
    success: 'Contraseña actualizada exitosamente. Otras sesiones revocadas.',
    errors: {
      empty: 'Por favor completa la contraseña actual y la nueva contraseña.',
      minLength: 'La nueva contraseña debe tener al menos 12 caracteres.',
      mismatch: 'La nueva contraseña y la confirmación no coinciden.',
      failed:
        'Error al cambiar la contraseña. Por favor verifica tu contraseña actual.',
    },
  },
  sessions: {
    title: 'Seguridad de Sesión y Dispositivos',
    description:
      'Tu sesión está protegida mediante cookies HTTP-only, SameSite con rotación automática.',
    guardTitle: 'Protección de Sesión Activa',
    guardDesc:
      'Los tokens de acceso se renuevan automáticamente en segundo plano sin interrumpir tu flujo.',
    revokeAllBtn: 'Revocar Todas las Sesiones',
    revokeSuccess: 'Todas las sesiones revocadas. Redirigiendo al inicio.',
    revokeError: 'No se pudieron revocar todas las sesiones.',
  },
};
