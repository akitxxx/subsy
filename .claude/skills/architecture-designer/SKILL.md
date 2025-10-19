---
name: architecture-designer
description: This skill should be used when designing new features, planning refactoring, reviewing implementations, or consulting on architectural decisions for the Next.js project. It provides guidance based on Clean Architecture, Domain-Driven Design (DDD), and feature-based organization principles.
---

# Architecture Designer

## Overview

Design and review software implementations following the project's architectural patterns: Clean Architecture, Domain-Driven Design (DDD), and feature-based organization.

## When to Use This Skill

- Designing a new feature or module
- Planning refactoring to match architectural patterns
- Reviewing implementation for architectural compliance
- Consulting on technical implementation choices

## Project Architecture Principles

### 1. Dependency Direction

Dependencies must flow inward:
- Frontend → Shared ← API
- Presentation → Application → Domain ← Infrastructure

**Never** allow domain layer to depend on infrastructure.

### 2. Layer Structure

```
Presentation Layer (React Components, Hooks)
      ↓
Application Layer (API Handlers, Use Cases)
      ↓
Domain Layer (Entities, Value Objects, Domain Services)
      ↑
Infrastructure Layer (Repositories, DB, External APIs)
```

### 3. Feature-Based Organization

```
src/
├── frontend/features/<feature>/
│   ├── components/
│   ├── hooks/
│   └── types/
├── api/features/<feature>/
│   ├── handlers/
│   ├── use-cases/
│   └── repositories/
└── shared/
    ├── domain/
    ├── types/
    └── utils/
```

## Design Workflow

### For New Features

1. **Define Domain Model**
   - Create entities with business logic in `src/shared/domain/`
   - Create value objects for domain concepts
   - Define repository interfaces

2. **Design Use Cases**
   - Place in `src/api/features/<feature>/use-cases/`
   - Orchestrate domain objects and repositories
   - Keep business logic in domain, not use cases

3. **Implement Repositories**
   - Place in `src/api/features/<feature>/repositories/`
   - Implement repository interfaces from domain
   - Use Drizzle ORM for database access

4. **Create API Handlers**
   - Place in `src/api/features/<feature>/handlers/`
   - Thin wrappers around use cases
   - Validate input with Zod
   - Handle HTTP concerns only

5. **Build Frontend**
   - Components in `src/frontend/features/<feature>/components/`
   - Hooks in `src/frontend/features/<feature>/hooks/`
   - Use SWR for server state, React Context for client state

### For Refactoring

1. **Analyze Current State**
   - Identify architectural violations
   - Document technical debt

2. **Design Target State**
   - Extract entities from procedural code
   - Introduce repository pattern
   - Separate business logic from infrastructure

3. **Plan Migration**
   - Break into incremental steps
   - Ensure backward compatibility
   - Prioritize high-impact changes

### For Code Review

Check the following:

**Architectural Compliance**
- [ ] Dependencies flow inward
- [ ] Business logic in entities, not handlers/components
- [ ] Use cases orchestrate, don't contain business logic
- [ ] Handlers are thin wrappers
- [ ] Components use hooks for logic separation

**File Organization**
- [ ] Feature-based organization followed
- [ ] Shared code in `src/shared/`
- [ ] No cross-feature dependencies (use shared layer)

**Code Quality**
- [ ] Single Responsibility Principle
- [ ] Type safety with TypeScript
- [ ] Error handling follows project patterns
- [ ] Tests for business logic

## Key Patterns

### Entity Example

```typescript
class Subscription {
  private constructor(
    public readonly id: string,
    private name: string,
    private status: SubscriptionStatus
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name) throw new Error("Name required");
  }

  public cancel(): void {
    if (this.status === SubscriptionStatus.Cancelled) {
      throw new Error("Already cancelled");
    }
    this.status = SubscriptionStatus.Cancelled;
  }
}
```

### Use Case Example

```typescript
class CreateSubscriptionUseCase {
  constructor(
    private subscriptionRepository: SubscriptionRepository
  ) {}

  async execute(input: CreateSubscriptionInput): Promise<CreateSubscriptionOutput> {
    // Orchestrate only - business logic in entity
    const subscription = Subscription.create(input);
    await this.subscriptionRepository.save(subscription);
    return { id: subscription.id };
  }
}
```

### Handler Example

```typescript
// Thin wrapper - validation and use case invocation only
export const createSubscriptionHandler = async (c: Context) => {
  const input = await c.req.json();
  const validated = createSubscriptionSchema.parse(input);

  const useCase = new CreateSubscriptionUseCase(subscriptionRepository);
  const result = await useCase.execute(validated);

  return c.json(result, 201);
};
```

## Common Pitfalls

1. **Anemic Domain Model**: Entities with no behavior
   - ❌ All logic in use cases
   - ✅ Entities encapsulate business rules

2. **Infrastructure Leaking**: Domain depending on infrastructure
   - ❌ Entity imports database types
   - ✅ Entity has no external dependencies

3. **Fat Use Cases**: Business logic in use cases
   - ❌ Complex calculations in use case
   - ✅ Use case delegates to domain

4. **Bypassing Layers**: Direct database access from handlers
   - ❌ Handler queries database
   - ✅ Handler calls use case

Apply these patterns consistently to maintain clean architecture.
