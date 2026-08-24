import argon2 from 'argon2';
import {
  BaseEntity,
  DomainException,
  generateUuid,
  type UuidVo,
} from '../../common';

import type { ProviderVo } from './provider.vo';
import { RoleVo } from './role.vo';

export interface UserProps {
  id?: UuidVo;
  email: string;
  hashedPassword?: string;
  providers: Set<ProviderVo>;
  role: RoleVo;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isMfaEnabled?: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export class User extends BaseEntity {
  #id: UuidVo;
  #email: string;
  #hashedPassword?: string;
  #providers: Set<ProviderVo>;
  #role: RoleVo;
  #isActive: boolean;
  #isEmailVerified: boolean;
  #isMfaEnabled: boolean;
  #mfaSecret?: string;
  #mfaBackupCodes: string[];
  #failedLoginAttempts: number;
  #lockoutUntil?: Date;
  #createdAt: Date;
  #updatedAt?: Date;
  #lastLoginAt?: Date;

  constructor(props: UserProps) {
    super();

    this.#id = props.id ?? generateUuid();
    this.#email = props.email;
    this.#hashedPassword = props.hashedPassword;
    this.#providers = props.providers;
    this.#role = props.role;
    this.#isActive = props.isActive ?? true;
    this.#isEmailVerified = props.isEmailVerified ?? false;
    this.#isMfaEnabled = props.isMfaEnabled ?? false;
    this.#mfaSecret = props.mfaSecret;
    this.#mfaBackupCodes = props.mfaBackupCodes ?? [];
    this.#failedLoginAttempts = props.failedLoginAttempts ?? 0;
    this.#lockoutUntil = props.lockoutUntil;
    this.#createdAt = props.createdAt ?? new Date(Date.now());
    this.#updatedAt = props.updatedAt;
    this.#lastLoginAt = props.lastLoginAt;

    this.recordOriginalValue('hashedPassword', this.#hashedPassword);
    this.recordOriginalValue('providers', new Set(this.#providers));
    this.recordOriginalValue('role', this.#role);
    this.recordOriginalValue('isActive', this.#isActive);
    this.recordOriginalValue('isEmailVerified', this.#isEmailVerified);
    this.recordOriginalValue('isMfaEnabled', this.#isMfaEnabled);
    this.recordOriginalValue('mfaSecret', this.#mfaSecret);
    this.recordOriginalValue('mfaBackupCodes', [...this.#mfaBackupCodes]);
    this.recordOriginalValue('failedLoginAttempts', this.#failedLoginAttempts);
    this.recordOriginalValue('lockoutUntil', this.#lockoutUntil);
    this.recordOriginalValue('updatedAt', this.#updatedAt);
    this.recordOriginalValue('lastLoginAt', this.#lastLoginAt);
  }

  enableMfa(secret: string, backupCodes: string[] = []) {
    const oldMfa = this.#isMfaEnabled;
    const oldSecret = this.#mfaSecret;
    const oldBackupCodes = [...this.#mfaBackupCodes];
    this.#isMfaEnabled = true;
    this.#mfaSecret = secret;
    this.#mfaBackupCodes = backupCodes;
    this.trackChange('isMfaEnabled', this.#isMfaEnabled, oldMfa);
    this.trackChange('mfaSecret', this.#mfaSecret, oldSecret);
    this.trackChange('mfaBackupCodes', this.#mfaBackupCodes, oldBackupCodes);
    this.#updateTimestamp();
  }

  disableMfa() {
    const oldMfa = this.#isMfaEnabled;
    const oldSecret = this.#mfaSecret;
    const oldBackupCodes = [...this.#mfaBackupCodes];
    this.#isMfaEnabled = false;
    this.#mfaSecret = undefined;
    this.#mfaBackupCodes = [];
    this.trackChange('isMfaEnabled', this.#isMfaEnabled, oldMfa);
    this.trackChange('mfaSecret', this.#mfaSecret, oldSecret);
    this.trackChange('mfaBackupCodes', this.#mfaBackupCodes, oldBackupCodes);
    this.#updateTimestamp();
  }

  setBackupCodes(hashedCodes: string[]) {
    const oldCodes = [...this.#mfaBackupCodes];
    this.#mfaBackupCodes = hashedCodes;
    this.trackChange('mfaBackupCodes', this.#mfaBackupCodes, oldCodes);
    this.#updateTimestamp();
  }

  consumeBackupCode(codeIndex: number) {
    if (codeIndex < 0 || codeIndex >= this.#mfaBackupCodes.length) {
      throw new DomainException('Invalid backup code index');
    }
    const oldCodes = [...this.#mfaBackupCodes];
    this.#mfaBackupCodes.splice(codeIndex, 1);
    this.trackChange('mfaBackupCodes', [...this.#mfaBackupCodes], oldCodes);
    this.#updateTimestamp();
  }

  incrementFailedLogin(maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
    const oldAttempts = this.#failedLoginAttempts;
    this.#failedLoginAttempts += 1;
    this.trackChange(
      'failedLoginAttempts',
      this.#failedLoginAttempts,
      oldAttempts,
    );

    if (this.#failedLoginAttempts >= maxAttempts) {
      const oldLockout = this.#lockoutUntil;
      this.#lockoutUntil = new Date(Date.now() + lockoutDurationMs);
      this.trackChange('lockoutUntil', this.#lockoutUntil, oldLockout);
    }
    this.#updateTimestamp();
  }

  resetFailedLogin() {
    if (this.#failedLoginAttempts === 0 && !this.#lockoutUntil) return;
    const oldAttempts = this.#failedLoginAttempts;
    const oldLockout = this.#lockoutUntil;
    this.#failedLoginAttempts = 0;
    this.#lockoutUntil = undefined;
    this.trackChange(
      'failedLoginAttempts',
      this.#failedLoginAttempts,
      oldAttempts,
    );
    this.trackChange('lockoutUntil', this.#lockoutUntil, oldLockout);
    this.#updateTimestamp();
  }

  isLockedOut(): boolean {
    if (!this.#lockoutUntil) return false;
    return this.#lockoutUntil.getTime() > Date.now();
  }

  async updatePassword(plainPassword: string) {
    const oldValue = this.#hashedPassword;
    this.#hashedPassword = await argon2.hash(plainPassword);
    this.trackChange('hashedPassword', this.#hashedPassword, oldValue);
    this.#updateTimestamp();
  }

  async verifyPassword(plainPassword: string) {
    if (!this.#hashedPassword)
      throw new DomainException(
        'Password is required to login with email. The password can be set during the first login.',
      );
    return await argon2.verify(this.#hashedPassword, plainPassword);
  }

  addProvider(provider: ProviderVo) {
    const oldValue = new Set(this.#providers);
    this.#providers.add(provider);
    this.trackChange(
      'providers',
      Array.from(this.#providers),
      Array.from(oldValue),
    );
    this.#updateTimestamp();
  }

  updateRole(role: RoleVo) {
    if (role === RoleVo.SUPERADMIN)
      throw new DomainException('There should only be one superuser');
    if (this.#role === RoleVo.SUPERADMIN)
      throw new DomainException('You cannot change the role of a superuser');

    const oldValue = this.#role;
    this.#role = role;
    this.trackChange('role', this.#role, oldValue);
    this.#updateTimestamp();
  }

  toggleIsActive() {
    const oldValue = this.#isActive;
    this.#isActive = !this.#isActive;
    this.trackChange('isActive', this.#isActive, oldValue);
    this.#updateTimestamp();
  }

  verifyEmail() {
    if (this.#isEmailVerified) return;

    const oldValue = this.#isEmailVerified;
    this.#isEmailVerified = true;
    this.trackChange('isEmailVerified', this.#isEmailVerified, oldValue);
    this.#updateTimestamp();
  }

  #updateTimestamp() {
    const oldValue = this.#updatedAt;
    this.#updatedAt = new Date(Date.now());
    this.trackChange('updatedAt', this.#updatedAt, oldValue);
  }

  updateLastLoginAt() {
    const oldValue = this.#lastLoginAt;
    // Don't need update the updatedAt attribute
    this.#lastLoginAt = new Date(Date.now());
    this.trackChange('lastLoginAt', this.#lastLoginAt, oldValue);
  }

  get data() {
    return {
      id: this.#id,
      email: this.#email,
      hashedPassword: this.#hashedPassword,
      providers: new Set(this.#providers),
      role: this.#role,
      isActive: this.#isActive,
      isEmailVerified: this.#isEmailVerified,
      isMfaEnabled: this.#isMfaEnabled,
      mfaSecret: this.#mfaSecret,
      mfaBackupCodes: [...this.#mfaBackupCodes],
      failedLoginAttempts: this.#failedLoginAttempts,
      lockoutUntil: this.#lockoutUntil,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
      lastLoginAt: this.#lastLoginAt,
    };
  }
}
