# Skill Registry — my-blog-api
Generated: 2026-05-08

## User Skills

| Skill | Trigger |
|-------|---------|
| branch-pr | Creating a PR, opening a pull request, preparing changes for review |
| issue-creation | Creating a GitHub issue, reporting a bug, requesting a feature |
| judgment-day | "judgment day", adversarial review, dual review, "juzgar" |
| documentation-writer | Writing technical documentation, guides, API docs |
| interface-design | Designing dashboards, admin panels, UI components |
| find-skills | Looking for a skill, "is there a skill for X" |

## Project Skills

| Skill | Trigger |
|-------|---------|
| nestjs-best-practices | Writing/reviewing/refactoring NestJS modules, controllers, services, guards, pipes |
| nodejs-best-practices | Node.js architecture decisions, framework selection, async patterns |
| nodejs-backend-patterns | Building REST APIs, middleware, error handling, authentication |
| typescript-advanced-types | Complex TypeScript types, generics, conditional types, type utilities |
| gemini-api-dev | Building with Gemini API, @google/genai SDK, multimodal content |

## Project Conventions

- `CLAUDE.md` — project architecture, entity relationships, key conventions, commands
- `src/app.module.ts` — root module wiring (ConfigModule, TypeOrmModule, UsersModule, PostsModule)
- `src/main.ts` — global pipes, filters, Swagger setup, Helmet
- `src/common/filters/` — TypeormExceptionFilter maps PG errors to HTTP
- `src/users/` — flat structure: controller, service, dtos/, entities/
- `src/posts/` — nested structure: controllers/, services/, dto/, entities/
- `src/auth/` — JWT + Passport strategies
- `src/ai/` — Gemini API integration

## Compact Rules

### nestjs-best-practices
- Use constructor-based DI (never manual instantiation)
- Controllers: HTTP only — no business logic; services: all business logic
- Apply DTOs at every request/response boundary; extend PartialType(CreateDto) for Update DTOs
- Add @ApiProperty() to every DTO field (project uses Swagger)
- Import PartialType from @nestjs/swagger (posts module) or @nestjs/mapped-types (users module) — keep consistent
- Use Guards for auth (@UseGuards(JwtAuthGuard)); validate with global ValidationPipe (whitelist: true, forbidNonWhitelisted: true, transform: true)
- TypeORM: use entities with @PrimaryGeneratedColumn(), @Column(), @OneToMany/@ManyToOne with proper join columns
- Group related logic in feature modules (UsersModule, PostsModule, AuthModule)
- Use @InjectRepository(Entity) for repository injection
- Handle DB errors via TypeormExceptionFilter (already global in main.ts)

### typescript-advanced-types
- Prefer type inference over explicit annotations when unambiguous
- Use utility types: Partial<T>, Pick<T, K>, Omit<T, K>, Record<K, V>
- Avoid `any` — use `unknown` for external/untyped data, then narrow with guards
- Use generics for reusable service/repository patterns
- Interface for shapes (entities, DTOs); type alias for unions/intersections
- strict mode is on — never bypass with as/!

### nodejs-backend-patterns
- Validate all input at HTTP boundary (controllers via class-validator + ValidationPipe)
- Centralize error handling (TypeormExceptionFilter handles DB layer; add domain errors as needed)
- Use @nestjs/config + dotenv for all environment variables — never hardcode secrets
- Prefer async/await over callbacks or raw Promises
- Use supertest + @nestjs/testing for integration tests

### gemini-api-dev
- SDK: @google/genai (already in dependencies as @google/genai ^1.51.0)
- Preferred models: gemini-2.5-pro (complex), gemini-2.5-flash (fast/balanced)
- Always handle async with try/catch and expose errors via NestJS exception filters
- Use structured output (response_schema) when integrating into typed NestJS responses
- Instantiate GoogleGenAI once and inject via NestJS DI

### branch-pr
- Use Conventional Commits: feat|fix|docs|refactor|test|chore(scope): description
- Reference the issue number in PR title or body
- Keep PRs focused: one logical change per PR
- Run pnpm lint + pnpm test before opening PR

### issue-creation
- Use issue-first: create an issue before starting a branch
- Title format: [type] Short description (feat, bug, chore, docs)
- Include: current behavior, expected behavior, reproduction steps (for bugs)
