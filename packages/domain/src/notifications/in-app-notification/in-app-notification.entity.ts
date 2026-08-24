import { BaseEntity, generateUuid, type UuidVo } from '../../common';

import { InAppNotificationVo } from './in-app-notification.vo';

export interface InAppNotificationProps {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type?: InAppNotificationVo;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InAppNotification extends BaseEntity {
  #id: UuidVo;
  #userId: string;
  #title: string;
  #message: string;
  #type: InAppNotificationVo;
  #metadata?: Record<string, unknown>;
  #isRead: boolean;
  #readAt?: Date | null;
  #createdAt: Date;
  #updatedAt?: Date;

  constructor(props: InAppNotificationProps) {
    super();
    this.#id = props.id ?? generateUuid();
    this.#userId = props.userId;
    this.#title = props.title;
    this.#message = props.message;
    this.#type = props.type ?? InAppNotificationVo.INFO;
    this.#metadata = props.metadata;
    this.#isRead = props.isRead ?? false;
    this.#readAt = props.readAt ?? (props.isRead ? new Date() : null);
    this.#createdAt = props.createdAt ?? new Date();
    this.#updatedAt = props.updatedAt ?? new Date();
  }

  markAsRead(): void {
    if (!this.#isRead) {
      this.#isRead = true;
      this.#readAt = new Date();
      this.#updatedAt = new Date();
    }
  }

  get data() {
    return {
      id: this.#id,
      userId: this.#userId,
      title: this.#title,
      message: this.#message,
      type: this.#type,
      metadata: this.#metadata,
      isRead: this.#isRead,
      readAt: this.#readAt,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
    };
  }
}
