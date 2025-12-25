import { StringValueObject } from 'src/contexts/shared/domain';

export enum ActorTypeE {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ANONYMOUS = 'ANONYMOUS',
}

export class SecurityEventActorTypeVo extends StringValueObject {
  static create(value: ActorTypeE) {
    return new SecurityEventActorTypeVo(value);
  }
}
