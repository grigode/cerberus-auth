import { StringValueObject } from 'src/contexts/shared/domain';

export class SecurityEventUserAgentVo extends StringValueObject {
  static create(value: string): SecurityEventUserAgentVo {
    return new SecurityEventUserAgentVo(value);
  }
}
