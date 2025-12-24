import { DateValueObject } from 'src/contexts/shared/domain';

export class RefreshTokenExpiresAtVo extends DateValueObject {
  // Expires in 15 minutes
  static generate(since: Date) {
    const date = since.getTime() + 15 * 60 * 1000;
    return new RefreshTokenExpiresAtVo(new Date(date));
  }
}
