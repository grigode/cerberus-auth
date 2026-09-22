export const GOOGLE_ENDPOINTS = {
  AUTHORIZE: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
  SCOPES: {
    PROFILE: 'https://www.googleapis.com/auth/userinfo.profile',
    EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  },
} as const;
