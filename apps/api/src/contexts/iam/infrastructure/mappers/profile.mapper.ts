import { Profile } from '@core/domain';
import type { LanguageCode } from '@core/domain';
import type { Mapper } from '@core/shared-server';

import { ProfileEntity } from '@core/database';

export class ProfileMapper implements Mapper<Profile, ProfileEntity> {
  domainToInfrastructure(entity: Profile): ProfileEntity {
    const data = entity.data;

    const profileEntiy = new ProfileEntity();
    profileEntiy.userId = data.userId;
    profileEntiy.firstName = data.firstName;
    profileEntiy.lastName = data.lastName;
    profileEntiy.avatarUrl = data.avatarUrl;
    profileEntiy.language = data.language;

    return profileEntiy;
  }

  infrastructureToDomain(entity: ProfileEntity): Profile {
    return new Profile({
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      avatarUrl: entity.avatarUrl,
      language: entity.language as LanguageCode,
    });
  }
}
