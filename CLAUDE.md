# CLAUDE.md - Guide for Claude

## Commands
- Development: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Tests: 
  - All: `pnpm test`
  - Backend: `pnpm test:back`
  - Frontend: `pnpm test:front`
  - Single test: `pnpm vitest src/path/to/file.spec.ts`
- Database:
  - Migrations: `pnpm db:migrate`
  - Reset: `pnpm db:reset`

## Code Style
- TypeScript: No `any`, prefer `type` over `interface`
- Naming: Components in PascalCase, hooks with `use` prefix
- Files: Component-centric structure with colocated tests (.spec.ts)
- Error handling: Typed errors with specific messages
- Components: <200 lines, split logic into custom hooks (useComponent.ts)
- Imports: Group by external, then internal
- Testing: TDD, colocated tests, describe/it pattern
- Formatting: 2-space indent, single quotes, 150 char width