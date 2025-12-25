import { StringValueObject } from 'src/contexts/shared/domain';

export enum TargetTypeE {
  USER = 'USER',
  SESSION = 'SESSION',
  TOKEN = 'TOKEN',
}

export class SecurityEventTargetTypeVo extends StringValueObject {
  static create(value: TargetTypeE) {
    return new SecurityEventTargetTypeVo(value);
  }
}
