import { DateValueObject } from 'src/contexts/shared/domain';

export class ConfirmationTokenExpiresAtVo extends DateValueObject {
  // Expires in 1 hour
  static generate(since: Date) {
    const date = since.getTime() + 60 * 60 * 1000;
    return new ConfirmationTokenExpiresAtVo(new Date(date));
  }
}
