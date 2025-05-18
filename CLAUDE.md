# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js with App Router (v15.1.4)
- **API Layer**: Hono for API routing
- **Database**:
  - Supabase for PostgreSQL database and authentication
  - Drizzle ORM for database access
- **Authentication**: Clerk for authentication
- **UI Components**:
  - Radix UI for accessible components
  - Tailwind CSS for styling
  - shadcn/ui component patterns
- **State Management**: 
  - SWR for server state
  - React Context for client state
  - React Hook Form for form state
- **Testing**: Vitest
- **Linting/Formatting**: Biome 
- **External Services**: LINE Bot SDK, OpenAI API
- **Runtime Requirements**: Node.js v20+, pnpm v10.5.2+

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development server with turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

### Testing

```bash
# Run all tests
pnpm test

# Run frontend tests only
pnpm test:front

# Run backend tests only
pnpm test:back
```

### Database Operations

```bash
# Start local Supabase
pnpm db:up

# Stop local Supabase
pnpm db:down

# Generate migration files
pnpm db:generate

# Run migrations on development database
pnpm db:migrate

# Run migrations on test database
pnpm db:migrate:test

# Reset development database (drop and recreate)
pnpm db:reset

# Reset test database (drop and recreate)
pnpm db:reset:test
```

## Architecture Overview

The project follows a modular monolith architecture with clear separation of concerns:

```
Client Layer (frontend) → Shared Layer (shared) ← Server Layer (api)
```

### Key Directories

- `src/` - Source code root
  - `app/` - Next.js App Router pages and layouts
  - `frontend/` - Frontend implementation
    - `features/` - Feature-specific modules (auth, dashboard, subscriptions, etc.)
    - `shared/` - Common components, hooks, and utilities
  - `api/` - API implementation
    - `features/` - Feature-specific API modules
    - `shared/` - Common API utilities, domain logic, and error handling
  - `shared/` - Code shared between frontend and API
    - `domain/` - Domain models and logic
    - `enums/` - Enumeration types
    - `types/` - Common type definitions
    - `utils/` - Shared utility functions
    - `lib/` - Library integrations

### Design Principles

1. **Clean Architecture Pattern**: The codebase follows onion architecture patterns with:
   - Clear separation between domain logic, application services, and infrastructure
   - Domain-driven design concepts with entity classes and value objects

2. **Feature-based Organization**: Code is primarily organized by feature rather than technical layer
   - Each feature has its own directory with components, hooks, and services
   - Co-location of related files within the feature directory

3. **Single Responsibility Principle**: Components and functions have focused responsibilities
   - UI components are separated from business logic using hooks
   - API handlers are thin layers over use cases

4. **Dependencies Flow Inward**: The dependency direction flows from:
   - Frontend features → Frontend shared → Shared
   - API features → API shared → Shared

## API Design

The API layer uses Hono for routing and handling requests:

1. **Handler Pattern**: 
   - Each endpoint has a dedicated handler (`*.handler.ts`)
   - Handlers validate input, invoke use cases, and transform responses

2. **Use Case Pattern**:
   - Business logic is encapsulated in use cases (`*.usecase.ts`)
   - Use cases orchestrate domain services and repositories

3. **Error Handling**:
   - Standardized error responses through error classes and middleware
   - Domain errors are mapped to appropriate HTTP status codes

## Frontend Design

The frontend architecture follows a component-based approach:

1. **Component Structure**:
   - UI components are in `frontend/shared/components`
   - Feature-specific components in `frontend/features/*/components`
   - Components use hooks for logic separation

2. **Hooks Pattern**:
   - Custom hooks encapsulate data fetching and state management
   - SWR is used for server state (caching, revalidation)
   - Feature-specific hooks in `frontend/features/*/hooks`

3. **Styling**:
   - Tailwind CSS with utility-first approach
   - Component variants using `clsx` and `tailwind-merge`

## Database and Data Access

1. **Database**: PostgreSQL via Supabase

2. **ORM**: Drizzle ORM
   - Schema defined in `src/api/shared/lib/db/schema.ts`
   - Migrations in `drizzle/migrations/`

3. **Repositories**:
   - Repository pattern for data access
   - Each domain entity has a corresponding repository
   - Located in `src/api/shared/domain/*/repository.ts`

## Testing Strategy

1. **Unit Tests**: Tests for individual functions and components
   - File naming: `*.spec.ts` or `*.spec.tsx`
   - Located alongside the code being tested

2. **Test Setup**:
   - Vitest as the test runner
   - Test utilities in `src/shared/test/`
   - Database test helpers in `src/api/shared/test/`

## Core Features

1. **Authentication**: 
   - Google OAuth via Clerk
   - Authentication state management
   - Protected routes and API endpoints

2. **Dashboard**: 
   - Overview of user data and subscriptions
   - Summary statistics

3. **Subscriptions**:
   - CRUD operations for subscriptions
   - Detailed view and management

4. **LINE Integration**:
   - Webhook handling for LINE messages
   - Function execution based on message content

## Additional Notes

- The project uses Biome for linting and formatting (not ESLint)
- Testing is prioritized, with TDD approach recommended
- Type safety is enforced throughout the codebase with TypeScript
- Domain models and business logic should be placed in the shared layer for reuse
- Use hooks pattern to separate UI from logic