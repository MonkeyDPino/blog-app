# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands can be run from the monorepo root or from `apps/backend/` directly.

```bash
# From monorepo root (recommended)
pnpm dev                                          # Start backend in watch mode
pnpm build:backend                                # Build backend
pnpm test                                         # Run backend unit tests
pnpm test:e2e                                     # Run backend e2e tests (requires running DB)

# From apps/backend/ directly
pnpm start:dev          # Watch mode
pnpm start:debug        # Debug + watch mode
pnpm build              # Compile to dist/
pnpm test               # All unit tests
pnpm test:watch         # Watch mode
pnpm test:cov           # With coverage
pnpm test:e2e           # End-to-end tests (requires running DB)

# Single test file (from apps/backend/)
pnpm test -- --testPathPattern=posts.service

# Code quality (from monorepo root)
pnpm lint               # ESLint with autofix (all workspaces)
pnpm format             # Prettier (all workspaces)

# Code quality (from apps/backend/)
pnpm lint               # ESLint with autofix
pnpm format             # Prettier

# Migrations (from apps/backend/)
pnpm migration:generate  # Generate migration
pnpm migration:run       # Run migrations
pnpm migration:show      # Show migration status

# Infrastructure
docker compose up -d    # Start PostgreSQL (5432) + PgAdmin (5050)
```

## Architecture

Monorepo with pnpm workspaces. NestJS REST API (backend) + Next.js app (frontend scaffold) + shared types package.

```
/                               # Monorepo root
├── tsconfig.base.json          # Shared TS compiler options
├── pnpm-workspace.yaml         # Workspace definitions
├── eslint.config.mjs           # ESLint config for all workspaces
├── .env                        # Environment variables (stays at root)
├── apps/
│   ├── backend/                # NestJS API (@blog/backend)
│   │   ├── src/
│   │   │   ├── app.module.ts       # Root: ConfigModule, TypeOrmModule, UsersModule, PostsModule
│   │   │   ├── main.ts             # Global ValidationPipe + TypeOrmExceptionFilter
│   │   │   ├── env.model.ts        # Typed interface for process.env
│   │   │   ├── common/filters/     # TypeormExceptionFilter — maps PG errors to HTTP responses
│   │   │   ├── users/              # Flat structure: controller, service, dtos/, entities/
│   │   │   └── posts/              # Nested structure: controllers/, services/, dto/, entities/
│   │   ├── test/               # E2E tests
│   │   ├── package.json        # @blog/backend package
│   │   ├── tsconfig.json       # Extends ../../tsconfig.base.json
│   │   └── nest-cli.json
│   └── frontend/               # Next.js app (@blog/frontend) — scaffold only
│       ├── src/app/
│       ├── package.json
│       └── tsconfig.json
└── packages/
    └── types/                  # Shared TypeScript interfaces (@blog/types)
        └── src/
            ├── index.ts
            ├── user.interface.ts
            ├── post.interface.ts
            └── auth.interface.ts
```

### Entity Relationships

```
User (1) ──── (1) Profile   [OneToOne, cascade, join: profile_id]
User (1) ──── (*) Post      [OneToMany via post.author]
Post (*) ──── (1) User      [ManyToOne, join: author_id]
Category                    # Has full CRUD (/categories) but no relation to Post entity yet
```

All entities use `@PrimaryGeneratedColumn()` (UUID not used) and `timestamptz` for timestamps.

### Key Conventions

- **TypeORM sync**: `synchronize: false`
- **Validation**: Global `ValidationPipe` with `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`
- **DTOs**: `UpdateDto extends PartialType(CreateDto)` pattern. `users` imports `PartialType` from `@nestjs/mapped-types`; `posts` imports it from `@nestjs/swagger` — both work but are inconsistent.
- **Swagger**: `@ApiProperty()` decorators on all DTO fields
- **Formatting**: Run `pnpm run format` after any multi-file edit to avoid Prettier lint failures
- **Error handling**: `TypeOrmExceptionFilter` handles PG unique violations and other DB errors globally

### Environment Variables

Defined in `apps/backend/src/env.model.ts` and loaded from `.env` at the **monorepo root** (`/path/to/blog-app/.env`):

```
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, PORT
```

Docker Compose defaults: host=localhost, port=5432, db=my_blog_db, user=blog_user, password=blog_password.

**Note**: The `.env` file stays at the monorepo root. `ConfigModule` in `app.module.ts` uses `join(__dirname, '../../../.env')` to resolve it correctly from the compiled output location.

## Access

The API is publicly accessible at: `https://blog-api.pinodev.app`

## Notes

- The `posts` module uses a nested folder structure (`controllers/`, `services/`) while `users` is flat — there's no project-wide convention yet.
- `Category` has full CRUD via `CategoriesController` + `CategoriesService` but no `ManyToMany` relation to `Post` yet.
- Test coverage is minimal (placeholder `should be defined` tests only).
- The frontend (`apps/frontend/`) is a scaffold only — no real pages yet.
- Shared types in `packages/types/` are available to all workspaces via the `@blog/types` path alias.
