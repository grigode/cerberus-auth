import { StringValueObject, ValidationError } from 'src/contexts/shared/domain';

export enum ActorTypeE {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ANONYMOUS = 'ANONYMOUS',
}

export class SecurityEventActorTypeVo extends StringValueObject {
  constructor(readonly value: ActorTypeE) {
    super(value);
  }

  static create(value: string): SecurityEventActorTypeVo {
    if (!Object.values(ActorTypeE).includes(value as ActorTypeE))
      throw new ValidationError(`Invalid SecurityEventActorType: ${value}`);

    return new SecurityEventActorTypeVo(value as ActorTypeE);
  }
}
