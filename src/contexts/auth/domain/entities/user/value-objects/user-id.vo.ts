import { IdValueObject } from 'src/contexts/shared/domain';

export class UserIdVo extends IdValueObject {
  private constructor(readonly value: number) {
    super(value);
  }
}
