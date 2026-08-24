import { generateUuid, type UuidVo } from '../common';

export interface StorageFileProps {
  id?: string;
  filename: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  path?: string;
  size?: number;
  createdAt?: Date;
}

export class StorageFile {
  #id: UuidVo;
  #filename: string;
  #originalname: string;
  #mimetype: string;
  #buffer: Buffer;
  #path?: string;
  #size: number;
  #createdAt: Date;

  constructor(props: StorageFileProps) {
    this.#id = props.id ?? generateUuid();
    this.#filename = props.filename;
    this.#originalname = props.originalname;
    this.#mimetype = props.mimetype;
    this.#buffer = props.buffer;
    this.#path = props.path;
    this.#size = props.size ?? props.buffer.length;
    this.#createdAt = props.createdAt ?? new Date();
  }

  get data() {
    return {
      id: this.#id,
      filename: this.#filename,
      originalname: this.#originalname,
      mimetype: this.#mimetype,
      buffer: this.#buffer,
      path: this.#path,
      size: this.#size,
      createdAt: this.#createdAt,
    };
  }
}
