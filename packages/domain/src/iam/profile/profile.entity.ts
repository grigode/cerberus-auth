import { BaseEntity, LanguageCodeVo, type UuidVo } from '../../common';

export interface ProfileProps {
  userId: UuidVo;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  language?: LanguageCodeVo;
}

export class Profile extends BaseEntity {
  #userId: UuidVo;
  #firstName: string;
  #lastName: string;
  #avatarUrl?: string;
  #language: LanguageCodeVo;

  constructor(props: ProfileProps) {
    super();
    this.#userId = props.userId;
    this.#firstName = props.firstName;
    this.#lastName = props.lastName;
    this.#avatarUrl = props.avatarUrl;
    this.#language = props.language ?? LanguageCodeVo.EN;
  }

  update(props: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    language?: LanguageCodeVo;
  }) {
    if (props.firstName !== undefined) this.#firstName = props.firstName;
    if (props.lastName !== undefined) this.#lastName = props.lastName;
    if (props.avatarUrl !== undefined) this.#avatarUrl = props.avatarUrl;
    if (props.language !== undefined) this.#language = props.language;
  }

  get data() {
    return {
      userId: this.#userId,
      firstName: this.#firstName,
      lastName: this.#lastName,
      avatarUrl: this.#avatarUrl,
      language: this.#language,
    };
  }
}
