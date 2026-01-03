import { StringValueObject, ValidationError } from 'src/contexts/shared/domain';

export enum TargetTypeE {
  USER = 'USER',
  SESSION = 'SESSION',
  TOKEN = 'TOKEN',
}

export class SecurityEventTargetTypeVo extends StringValueObject {
  constructor(readonly value: TargetTypeE) {
    super(value);
  }

  static create(value: string): SecurityEventTargetTypeVo {
    if (!Object.values(TargetTypeE).includes(value as TargetTypeE))
      throw new ValidationError(`Invalid SecurityEventTargetType: ${value}`);

    return new SecurityEventTargetTypeVo(value as TargetTypeE);
  }
}
