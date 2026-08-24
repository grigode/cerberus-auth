import * as datefns from 'date-fns';
import { nanoid } from 'nanoid';
import { BaseEntity, generateUuid, type UuidVo } from '../../common';

export interface PasswordResetTokenProps {
  id?: UuidVo;
  userId: UuidVo;
  token?: string;
  createdAt?: Date;
  expiresAt?: Date;
  usedAt?: Date;
}

export class PasswordResetToken extends BaseEntity {
  #id: UuidVo;
  #userId: UuidVo;
  #token: string;
  #createdAt: Date;
  #expiresAt: Date;
  #usedAt?: Date;

  constructor(props: PasswordResetTokenProps) {
    super();

    const createdAt = props.createdAt ?? new Date(Date.now());

    this.#id = props.id ?? generateUuid();
    this.#userId = props.userId;
    this.#token = props.token ?? nanoid(32);
    this.#createdAt = createdAt;
    this.#expiresAt = props.expiresAt ?? datefns.addHours(createdAt, 1);
    this.#usedAt = props.usedAt;

    this.recordOriginalValue('usedAt', this.#usedAt);
  }

  markAsUsed() {
    const oldValue = this.#usedAt;
    this.#usedAt = new Date(Date.now());
    this.trackChange('usedAt', this.#usedAt, oldValue);
  }

  isValid() {
    return !this.#usedAt && datefns.isAfter(this.#expiresAt, new Date());
  }

  get data() {
    return {
      id: this.#id,
      userId: this.#userId,
      token: this.#token,
      createdAt: this.#createdAt,
      expiresAt: this.#expiresAt,
      usedAt: this.#usedAt,
    };
  }
}
