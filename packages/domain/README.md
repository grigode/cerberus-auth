# @core/domain

The `@core/domain` package contains the core business logic, entities, value objects, domain exceptions, and port interfaces of the application. It follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

This package is completely **framework-agnostic** and written in pure TypeScript. It has zero dependencies on infrastructure, databases, NestJS, HTTP frameworks, or external APIs.

---

## What Belongs Here (Allowed)

- **Entities & Aggregates**: Core business models encapsulated with private state and domain methods (e.g., `User`, `Profile`, `RefreshToken`, `InAppNotification`).
- **Value Objects (VOs) & Enums**: Immutable domain values and type definitions (e.g., `UuidVo`, `LanguageCodeVo`, `RoleVo`, `ProviderVo`).
- **Domain Exceptions**: Specific domain errors thrown when business rules or invariants are violated (e.g., `DomainException`).
- **Ports (Driven & Driver Interfaces)**: Interfaces defining contracts for infrastructure services and primary use-case drivers without coupling to specific implementations (e.g., `UserDrivenPort`, `EncryptionDrivenPort`, `AccessTokenDrivenPort`, `NotificationQueueDriverPort`).
- **Domain Services / Policies**: Pure business algorithms or domain logic that spans across multiple entities.
- **Unit Tests (`*.spec.ts`)**: Fast unit tests verifying domain invariants, state transitions, and business rules using Jest.

---

## What Does NOT Belong Here (Forbidden)

- **Framework & Infrastructure Code**: No NestJS decorators (`@Injectable()`, `@Module()`), Fastify, Express, TypeORM, Prisma, BullMQ, AWS SDKs, or Axios.
- **Database Models & ORM Entities**: Database schemas, TypeORM entities (`@Entity()`, `@Column()`), and migrations belong in `@core/database`.
- **Controllers, DTOs & HTTP Logic**: Request/response DTOs, Swagger documentation, and HTTP handlers belong in `apps/api`.
- **Environment & Global Configuration**: Environment variables, `.env` parsing, and app configurations belong in `@core/config`.

---

## Architecture Guidelines & Best Practices

### 1. Bounded Context Decoupling (Modular Monolith)

Each subdomain (`iam`, `notifications`, `audit`, etc.) represents a separate Bounded Context.

- **Reference by ID, Never by Direct Entity**: Cross-domain references must use IDs (`userId: UuidVo`), **never** direct entity instances.
  - **Correct**: `InAppNotificationProps` contains `userId: UuidVo | string`.
  - **Incorrect**: `InAppNotificationProps` contains `user: User`.
- **Communicate via Ports or Events**: Subdomains must interact through defined Port interfaces or domain events, keeping subdomains independently extractable if needed in the future.

### 2. Strict Encapsulation & Invariants

- Use ECMAScript private fields (`#id`, `#email`) to protect internal entity state.
- Expose state safely via explicit getters (e.g., `get data()`).
- State mutations **must** happen through explicit domain methods representing business intentions (e.g., `verifyEmail()`, `markAsRead()`, `revoke()`), never through direct property assignments.

### 3. Pure TypeScript & Zero Infrastructure Coupling

- Domain code must execute in any JS runtime (Node.js, browser, edge) without external services running.
- Infrastructure dependencies must be inverted using **Driven Ports** (interfaces) defined in the domain and implemented in infrastructure layers (`@core/database`, `apps/api`, etc.).

### 4. Barrel File Export Discipline

- Each subdomain exports its public API through its own `index.ts` (e.g., `src/iam/index.ts`, `src/notifications/index.ts`).
- Avoid importing deep private files across subdomains. Import only from public barrel files.

---

## Directory Structure

```text
packages/domain/src/
├── audit/
│   └── audit-log/                 # Entities, VOs, and ports for auditing
├── common/                        # Base primitives (BaseEntity, DomainException, VOs, shared ports)
├── iam/
│   ├── confirmation-token/
│   ├── password-reset-token/
│   ├── profile/
│   ├── refresh-token/
│   └── user/                      # User aggregate, VOs, ports, and tests
└── notifications/
    └── in-app-notification/       # In-app notification domain, VOs, and ports
```

---

## Running Tests

Unit tests in `@core/domain` test pure domain logic with fake timers and mocked ports:

```bash
# Run domain unit tests
pnpm --filter @core/domain test

# Run tests in watch mode
pnpm --filter @core/domain test:watch

# Generate coverage report
pnpm --filter @core/domain test:cov
```
