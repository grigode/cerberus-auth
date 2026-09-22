import { Injectable } from '@nestjs/common';
import type { Profile, ProfileDrivenPort } from '@core/domain';
import { Inject } from '@core/shared-server';
import type { UuidVo } from '@core/domain';
import { MAIN_DATA_SOURCE } from '@core/database';
import type { DataSource, Repository } from 'typeorm';

import { ProfileMapper } from '../../mappers';
import { ProfileEntity } from '@core/database';

@Injectable()
export class ProfileDrivenTypeormAdapter implements ProfileDrivenPort {
  private readonly profileRepository: Repository<ProfileEntity>;
  private mapper = new ProfileMapper();

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.profileRepository = dataSource.getRepository(ProfileEntity);
  }

  async findByUserId(userId: UuidVo): Promise<Profile | null> {
    const profile = await this.profileRepository.findOneBy({ userId });
    return profile ? this.mapper.infrastructureToDomain(profile) : null;
  }

  async create(profile: Profile): Promise<Profile> {
    const profileEntity = this.mapper.domainToInfrastructure(profile);
    const newProfile = await this.profileRepository.save(profileEntity);
    return this.mapper.infrastructureToDomain(newProfile);
  }

  async update(profile: Profile): Promise<Profile> {
    const profileEntity = this.mapper.domainToInfrastructure(profile);
    const updatedProfile = await this.profileRepository.save(profileEntity);
    return this.mapper.infrastructureToDomain(updatedProfile);
  }
}
