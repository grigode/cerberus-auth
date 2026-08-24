import * as uuid from 'uuid';

export type UuidVo = string;

export const generateUuid = (): UuidVo => uuid.v7();
