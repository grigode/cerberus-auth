# Authentication & Authorization Data Model

This document describes the authentication, authorization, session management,
and security-related entities used in the system.

You can view db diagram in [dbdiagram.io](https://dbdiagram.io/d/696ab933d6e030a0244aef76)

---

## User

### UserEntity

Represents the core user identity.

- id: uuid
- username: varchar(32), unique
- is_active: boolean
- created_at: datetime
- updated_at: datetime

---

## Authentication Providers

### UserAuthProviderEntity

Represents authentication credentials per provider.

- id: uuid
- user_id: uuid
- provider_id: int
- provider_user_id: varchar(255)  
  External identifier (e.g. OAuth `sub`)
- email: varchar(255)  
  Unique per provider
- password_hash: varchar(255)  
  Only for EMAIL provider
- must_rotate_credentials: boolean
  Indicates whether the user must rotate credentials on next login
  (e.g. seed users, imported accounts, or security-enforced resets)
- created_at: datetime
- verified_at: datetime | null

---

### ProviderEntity

Authentication provider catalog.

- id: int
- name: varchar(32), unique

---

## Multi-Factor Authentication

### UserMfaEntity

Stores encrypted MFA secrets.

- id: uuid
- secret_ciphertext: varbinary(255)
- iv: varbinary(12)
- auth_tag: varbinary(16)
- enabled_at: datetime | null
- confirmed_at: datetime | null
- last_used_at: datetime | null
- deleted_at: datetime | null
- created_at: datetime
- user_id: uuid

---

## Tokens

### ConfirmationTokenEntity

Used for email verification and password resets.

- id: uuid
- type: enum (EMAIL_VERIFICATION, PASSWORD_RESET)
- token_hash: char(64)
- issued_at: datetime
- expires_at: datetime
- used_at: datetime | null
- user_id: uuid

---

### RefreshTokenEntity

Long-lived token used to issue new access tokens.

- id: uuid
- session_id: uuid
- token_hash: char(64), unique
- revoke_at: datetime | null
- created_at: datetime
- expires_at: datetime
- replaced_by_token_id: uuid | null
- issued_by_ip: varchar(45)

---

## Sessions & Devices

### SessionEntity

Represents an authenticated session.

- id: uuid
- user_id: uuid
- user_device_id: uuid
- ip_address: varchar(45)
- user_agent: text
- created_at: datetime
- last_used_at: datetime
- expires_at: datetime | null
- revoked_at: datetime | null
- login_method: enum (PASSWORD, OAUTH)

---

### UserDeviceEntity

Tracks known devices per user.

- id: uuid
- device_info: JSON
- trusted: boolean
- created_at: datetime
- last_used_at: datetime | null
- deleted_at: datetime | null

---

## Authorization

### RoleEntity

- id: int
- name: varchar(32), unique

### PermissionEntity

- id: int
- name: varchar(32), unique

### UserRoleEntity

- user_id: uuid
- role_id: int
- assigned_at: datetime

### RolePermissionEntity

- role_id: int
- permission_id: int

---

## Profile

### ProfileEntity

Optional user profile data.

- user_id: uuid
- firstname: varchar(32)
- lastname: varchar(32)
- avatar: varchar(255)

---

## Security & Auditing

### SecurityEventEntity

Represents security-relevant events.

- id: uuid
- type: enum (
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  MFA_FAILED,
  PASSWORD_CHANGED,
  TOKEN_REVOKED
  )
- actor_type: enum (USER, SYSTEM, ANONYMOUS)
- actor_id: uuid | null
- target_type: enum (USER, SESSION, TOKEN)
- target_id: uuid
- ip_address: varchar(45)
- user_agent: text
- metadata: JSON
- occurred_at: datetime

---

### LoginAttemptEntity

Tracks login attempts for auditing and rate-limiting.

- id: uuid
- email: varchar(255) | null
- user_id: uuid | null
- result: boolean
- ip_address: varchar(45)
- user_agent: text
- failure_reason: enum (INVALID_EMAIL, INVALID_PASSWORD) | null
- attempted_at: datetime

---

## Device Info JSON Structure

```json
{
  "device_type": "desktop | mobile | tablet",
  "os": {
    "name": "Windows | Linux | Android | iOS | macOS",
    "version": "string"
  },
  "browser": {
    "name": "Chrome | Firefox | Edge | Safari",
    "version": "string"
  },
  "user_agent": "string",
  "device_id": "string | null",
  "screen": {
    "width": 1920,
    "height": 1080
  },
  "language": "es-PE",
  "timezone": "America/Lima",
  "is_bot": false
}
```

---

## Notes

- Enums are preferred for stable domain concepts.
- Catalog tables should be introduced only when values require dynamic management.
- Security events may be emitted asynchronously via an event bus.
