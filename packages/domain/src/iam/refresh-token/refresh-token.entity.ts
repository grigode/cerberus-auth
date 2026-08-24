import * as datefns from 'date-fns';
import { nanoid } from 'nanoid';
import { BaseEntity, generateUuid, type UuidVo } from '../../common';

export interface RefreshTokenProps {
  id?: UuidVo;
  userId: UuidVo;
  token?: string;
  revokedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt?: Date;
}

export class RefreshToken extends BaseEntity {
  #id: UuidVo;
  #userId: UuidVo;
  #token: string;
  #revokedAt?: Date;
  #expiresAt: Date;
  #createdAt: Date;
  #userAgent?: string;
  #ipAddress?: string;
  #lastUsedAt?: Date;

  constructor(props: RefreshTokenProps) {
    super();
    this.#id = props.id ?? generateUuid();
    this.#userId = props.userId;
    this.#token = props.token ?? nanoid(64);
    this.#revokedAt = props.revokedAt;
    this.#expiresAt = props.expiresAt ?? datefns.addDays(Date.now(), 7);
    this.#createdAt = props.createdAt ?? new Date(Date.now());
    this.#userAgent = props.userAgent;
    this.#ipAddress = props.ipAddress;
    this.#lastUsedAt = props.lastUsedAt ?? new Date(Date.now());

    this.recordOriginalValue('revokedAt', this.#revokedAt);
  }

  revoke() {
    const oldValue = this.#revokedAt;
    this.#revokedAt = new Date(Date.now());
    this.trackChange('revokedAt', this.#revokedAt, oldValue);
  }

  updateLastUsed() {
    const oldValue = this.#lastUsedAt;
    this.#lastUsedAt = new Date(Date.now());
    this.trackChange('lastUsedAt', this.#lastUsedAt, oldValue);
  }

  get data() {
    return {
      id: this.#id,
      userId: this.#userId,
      token: this.#token,
      revokedAt: this.#revokedAt,
      expiresAt: this.#expiresAt,
      createdAt: this.#createdAt,
      userAgent: this.#userAgent,
      ipAddress: this.#ipAddress,
      lastUsedAt: this.#lastUsedAt,
    };
  }
}
