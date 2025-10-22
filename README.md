# Authentication Template — NestJS + TypeORM

A modular authentication template built with **NestJS** and **TypeORM**, following **Hexagonal Architecture** and the **Repository Pattern**.  
It provides a clean, scalable foundation for building secure and maintainable backend applications.

---

## Features

- Hexagonal Architecture (Ports & Adapters)
- Repository Pattern for data persistence
- Authentication with JWT
- Modular and testable design
- Clear domain boundaries
- Unit and integration tests
- Compatible with MySQL or other SQL databases
- Follows SOLID principles

---

## Tech Stack

- **NestJS** — backend framework for scalable applications
- **TypeORM** — ORM for relational databases
- **TypeScript** — type-safe JavaScript
- **Jest** — testing framework

---

## Architecture Overview

This project is structured according to **Hexagonal Architecture (Ports & Adapters)**.

```

src/
├── application/      # Use cases and business logic
├── domain/           # Entities, value objects, repository interfaces
├── infrastructure/   # Adapters: database, controllers, services
├── test/             # Unit and integration tests
└── main.ts           # Application entry point

```

The goal is to keep the domain independent from frameworks and infrastructure, making it easier to test, maintain, and extend.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/griegocode/auth-template.git
cd auth-template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and set your environment variables (e.g., database credentials, JWT secret).

### 4. Run the application

```bash
npm run start:dev
```

### 5. Run tests

```bash
npm run test
```

---

## Use Cases

- Starting new projects that require authentication
- Learning or applying Hexagonal Architecture in a practical setup
- Building scalable backend templates with clean architecture principles

---

## Author

Developed by [Griego Code](https://github.com/grigode) — creating libraries, tools, and custom software solutions with purpose.

---

## License

This project is licensed under the MIT License.
