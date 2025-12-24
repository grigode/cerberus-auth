import { User } from '../user';
import {
  ProfileIdVo,
  ProfileFirstNameVo,
  ProfileLastNameVo,
  ProfileProfileImageVo,
} from './value-objects';

export interface ProfileI {
  id: ProfileIdVo | null;
  firstName: ProfileFirstNameVo;
  lastName: ProfileLastNameVo;
  profileImage: ProfileProfileImageVo | null;
  user: User | null;
}

export type ProfileCreateT = Omit<ProfileI, 'id'>;

export interface ProfileResponse {
  firstName: string;
  lastName: string;
  profileImage: string | undefined;
}

export class Profile implements ProfileI {
  id: ProfileIdVo | null;
  firstName: ProfileFirstNameVo;
  lastName: ProfileLastNameVo;
  profileImage: ProfileProfileImageVo | null;
  user: User | null;

  constructor(attr: ProfileI) {
    this.id = attr.id;
    this.firstName = attr.firstName;
    this.lastName = attr.lastName;
    this.profileImage = attr.profileImage;
    this.user = attr.user;
  }

  static create(attrs: ProfileCreateT) {
    return new Profile({
      ...attrs,
      id: null,
    });
  }

  toResponse() {
    return {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      profileImage: this.profileImage?.value,
    };
  }
}
