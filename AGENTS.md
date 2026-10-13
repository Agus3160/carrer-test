# AGENTS.md — AI Agent Guide for CheckCareer

This document provides the context and conventions AI agents need to work efficiently on **CheckCareer**, a career aptitude test based on dimension scoring, with compatibility percentages for each career.

## 1. Tech Stack

- **Framework:** Next.js 16.4.0, App Router, React Server Components (RSC), Server Actions.
- **Language:** TypeScript 5, strict mode.
- **UI:** Tailwind CSS v4, tw-animate-css, shadcn/ui (base-nova), Base UI, lucide-react.
- **Forms:** React Hook Form, Zod 4.
- **Authentication:** Custom sessions using HTTP-only cookies and bcrypt password hashing. No NextAuth.
- **Database:** PostgreSQL, Prisma ORM 7.10.0, Prisma Pg Adapter.
- **Prisma client:** Generated in `generated/prisma/`.
- **Utilities:** clsx, `cn`, class-variance-authority.
- **Linting:** ESLint 9, eslint-config-next 16.4.0.
- **Package manager:** pnpm 11.9.0.
- **Development:** Turbopack.

### Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Configuration

- Import alias: `@/*` → `./*`.
- shadcn aliases: `@/shared/components`, `@/shared/lib/utils`, `@/shared/components/ui`, `@/shared/lib`, `@/shared/hooks`.
- RSC enabled.
- Environment loaded through `dotenv/config` (see `.env`).

### Prisma Commands

```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate deploy
pnpm tsx prisma/seed.ts
pnpm prisma studio
```

Use `prisma generate` after schema changes, migrations for database changes, the seed command to populate data, and Prisma Studio to inspect the database.

## 2. Architecture

### Project Structure

```text
checkcareer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Placeholder landing page
│   ├── globals.css
│   ├── auth/signin/
│   ├── panel/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dimension/           # Implemented CRUD
│   └── proxy.ts
├── features/
│   ├── auth/
│   │   ├── actions/
│   │   ├── components/
│   │   └── schemas/
│   ├── dimension/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── queries/
│   │   └── schemas/
│   └── panel/components/
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   └── pagination.tsx
│   ├── lib/                     # Prisma, sessions, results, pagination,
│   │                            # environment, formatting, passwords
│   └── types/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── generated/prisma/
├── public/
├── .env
└── AGENTS.md
```

### Architecture and Patterns

- **Feature-first:** Organize code by domain (`auth`, `dimension`, `panel`). Features may contain `actions/`, `components/`, `queries/`, and `schemas/`.
- **Server-first:** Prefer Server Components and Server Actions. Use client components only when necessary.
- **Soft delete:** Main entities use `deletedAt`. Filter reads with `deletedAt: null`; delete by setting `deletedAt: new Date()`.
- **Typed results:** Use `ActionResult<T>` from `shared/types/action-result.ts` and helpers from `shared/lib/result.ts`.
- **Pagination:** Reuse `Paginated<T>` and helpers from `shared/lib/pagination.ts`: `resolvePagination`, `getPaginationMeta`, `getPageItems`, and `buildPageHref`.
- **Sessions:** Use `shared/lib/session.ts` for `getSession`, `getSessionOrRedirect`, `createSession`, and `logout`. Sessions use random 32-byte hex tokens, SHA-256 hashing with `SESSION_SECRET`, configurable TTL, revocation, and React `cache`.
- **Validation:** Use Zod schemas per feature. Coerce IDs with `z.coerce.number().int().positive()`.
- **Prisma:** Use the singleton client with the PostgreSQL adapter and global caching in development.

### Environment Variables

Validated through `shared/lib/env.ts`:

```env
DATABASE_URL=postgresql://...
NODE_ENV=development|test|production
SESSION_SECRET=strong-random-secret
SESSION_COOKIE_NAME=session
SESSION_TTL_MS=2592000000
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin123*
```

`SESSION_TTL_MS` defaults to 30 days (`2592000000` milliseconds). The current configuration reportedly uses `604800` milliseconds, which is only 7 days. Verify the intended value before changing it.

The default development secret must never be used in production. Keep credentials and secrets out of source control.

## 3. Database and Career Scoring

The core requirement is a **dimension-weighted career assessment that calculates a compatibility percentage for every career**.

### Main Entities

| Model | Purpose |
|---|---|
| `Candidate` | Person taking the assessment; includes name, unique `ci`, unique email, and soft delete. |
| `Assessment` | Assessment instance containing a candidate, answers, results, and completion timestamp. |
| `Dimension` | Vocational or psychological evaluation dimension; relates to questions and career weights. |
| `Career` | Career or profession receiving a compatibility score. |
| `CareerDimension` | Join model linking careers and dimensions, with `weight` defaulting to `1.0`. |
| `Question` | Question assigned to a dimension; types include `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SCALE`, and `TEXT`. |
| `QuestionOption` | Answer option with a numeric `value` representing its score. |
| `Answer` | Assessment response, referencing an option or storing a direct numeric/text value. |
| `Result` | Career score for an assessment; includes `score`, optional `description`, and unique `(assessmentId, careerId)`. |
| `User` / `Session` | Administrative authentication and session management. |

Always inspect `prisma/schema.prisma` before modifying models or implementing scoring. The actual schema is authoritative.

### Scoring Logic

1. Each question belongs to a dimension through `dimensionId`.
2. Each career has a weight for each relevant dimension through `CareerDimension`.
3. Answers obtain their numeric score from `QuestionOption.value` or `Answer.value`.
4. Each assessment groups a candidate's answers.
5. Calculate and persist one normalized score per career in `Result.score`.

**Recommended formula:**

For each career \(C\):

1. Calculate the raw score for each relevant dimension \(D\) using the assessment's answers.
2. Normalize each dimension score to a common 0–100 scale using its theoretical minimum and maximum.
3. Apply the career-specific dimension weights.
4. Divide by the sum of applicable weights.

\[
\text{Score}_C =
\frac{\sum_D w_{C,D}\cdot s_D}
{\sum_D w_{C,D}}
\]

Here, \(w_{C,D}\) is the career's weight for dimension \(D\), and \(s_D\) is its normalized score from 0 to 100.

**Important implementation considerations:**

- Define scoring rules for each question type before implementing calculations.
- For multiple-choice questions, specify whether selected values are summed, averaged, or otherwise combined.
- Establish theoretical score ranges for normalization; do not assume every question uses the same scale.
- Handle unanswered questions consistently. Avoid treating missing answers as zero unless that is the defined scoring rule.
- Ensure zero or invalid weight totals cannot cause division by zero.
- Validate weights and scores, and constrain final percentages to the intended range.
- Use transactions for consistent result persistence.
- Store the calculated score in `Result.score`, preferably on a 0–100 scale.

## 4. Routes and Implementation Status

| Route | Status |
|---|---|
| `/` | Basic placeholder landing page |
| `/auth/signin` | Implemented login |
| `/panel` | Implemented dashboard and authentication gate |
| `/panel/dimension` | Implemented paginated dimension list |
| `/panel/dimension/new` | Implemented dimension creation |
| `/panel/dimension/[id]` | Implemented dimension details |
| `/panel/dimension/[id]/edit` | Implemented dimension editing |
| `/panel/carrer` | Implemented paginated career list. Note the existing spelling. |
| `/panel/carrer/new` | Implemented career creation with per-dimension weights |
| `/panel/carrer/[id]` | Implemented career details |
| `/panel/carrer/[id]/edit` | Implemented career editing |
| `/panel/questions` | Implemented paginated question list |
| `/panel/questions/new` | Implemented question creation with options |
| `/panel/questions/[id]` | Implemented question details |
| `/panel/questions/[id]/edit` | Implemented question editing |
| `/panel/candidates` | Pending |
| `/panel/assessments` | Pending |
| `/panel/results` | Pending |
| `/test/*` | Pending |
| `/resultados/*` | Pending |

Inspect existing routes and navigation before adding or renaming routes.

## 5. Coding Conventions

### File Organization

- Use `@/` imports.
- Server Actions: `*.actions.ts`, starting with `"use server"`.
- Database queries: `*.queries.ts`; use `import "server-only"` where appropriate.
- Validation: `*.schema.ts`, using Zod and Spanish error messages.
- Components: `PascalCase.tsx`.
- Default to Server Components. Add `"use client"` only when necessary.
- Reuse existing shared utilities and feature patterns rather than introducing new abstractions without a need.

### Shared Building Blocks

Reuse these cross-feature helpers before creating feature-specific equivalents:

- `shared/lib/validation.ts` → `idSchema` for positive integer ID coercion.
- `shared/components/page-header.tsx` → list page title, description, and action.
- `shared/components/back-link.tsx` → back navigation button.
- `shared/components/empty-state.tsx` → empty list/collection state.
- `shared/components/table-skeleton.tsx` and `shared/components/entity-skeleton.tsx` → Suspense fallbacks.
- `shared/components/row-actions.tsx` → row dropdown (view, edit, delete) with confirmation dialog.
- `shared/components/pagination.tsx` and `shared/lib/pagination.ts` → pagination UI and helpers.
- `shared/components/form-fields.tsx` → `TextField`, `TextareaField`, and `SelectField` React Hook Form bindings with `Field` layout and error display.
- `shared/components/ui/select.tsx` → Base UI select primitives (`Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`).

### Navigation

- Every feature detail/edit view must expose a back link using `BackLink`.
- The back link of both the detail and the edit views must always return to the resource listing (for example `/panel/dimension`), never to another detail view.
- After a successful create or update, redirect to the resource listing.

### Server Actions

Follow the established dimension feature pattern:

1. Authenticate using `getSession()` or `getSessionOrRedirect()`, as appropriate.
2. Validate input with Zod.
3. Check authorization and related record existence.
4. Execute the requested operation.
5. Return a typed `ActionResult<T>` using the existing result helpers.
6. Revalidate all affected paths with `revalidatePath()`.

Forms validate user input with React Hook Form and the feature's shared Zod schema, so actions that receive an already-validated form body must not re-validate it (`safeParse`). Keep validating identifiers and enforcing business rules (existence, uniqueness, related records) on the server.

Use Spanish messages for user-facing success and error results.

### Database Queries

- Filter soft-deleted records with `deletedAt: null`.
- Use transactions when multiple operations must remain consistent.
- Preserve pagination conventions and metadata.
- Avoid exposing database access to client components.

### Pagination

- Read `searchParams.page`, accounting for `string | string[]`.
- Use existing parsing and pagination helpers.
- Preserve `DEFAULT_PAGE_SIZE = 8`.
- Reuse `shared/components/pagination.tsx`.

### Formatting and UI

- Format dates using `formatDateTime` from `shared/lib/format.ts`, based on `Intl` and `es-ES`.
- Use Tailwind v4 semantic classes such as `text-muted-foreground`.
- Follow the existing shadcn/ui base-nova style and lucide icon conventions.
- Keep all user-facing UI in Spanish.
- Support loading states, empty states, clear error messages, and basic accessibility.

### Type Safety

- Maintain TypeScript strict mode.
- Avoid `any`.
- Infer types from Zod and Prisma where practical.
- Import generated Prisma types from `@/generated/prisma/client`, following existing imports.

## 6. Security Requirements

- Validate sessions on every sensitive Server Action and protected query.
- Use HTTP-only cookies, secure settings in production, `sameSite: "strict"`, expiration, and revocation.
- Hash passwords with bcrypt; existing authentication and seed flows use cost factor 12.
- Protect administrative routes and operations with authorization checks.
- Validate user input with Zod and verify business rules separately.
- Keep secrets in environment variables and never expose them to client code.
- Use soft delete consistently.
- Do not trust the UI or route protection alone as authorization; enforce access checks on the server.

## 7. Required Workflow Before Coding

1. Read `AGENTS.md`, `prisma/schema.prisma`, and the relevant routes and feature files.
2. Inspect `features/dimension/` when implementing another CRUD feature.
3. Review existing actions, queries, schemas, components, and shared helpers.
4. Check `package.json` before assuming dependencies or APIs.
5. Search for existing usages before changing shared code.
6. Understand relationships and scoring rules before implementing assessments or results.
7. Follow existing patterns unless a concrete technical reason requires a change.

## 8. Quality Assurance

After making changes:

1. Run `npx tsc --noEmit` for type checking.
2. Run `pnpm lint` and fix relevant errors.
3. Run `pnpm build` for structural or integration changes.
4. Verify affected routes, authentication, CRUD operations, and pagination.
5. Check for existing test infrastructure before adding tests; do not assume a test framework is installed.
6. **Never commit changes unless explicitly requested.**

## 9. Response Guidelines for AI Agents

- Keep responses concise, normally under four lines unless more detail is necessary.
- Reference code using `file_path:line_number` when applicable.
- Explain nontrivial shell commands before showing them.
- Avoid unnecessary comments in code unless requested.
- Minimize tokens and avoid unnecessary introductions or conclusions.

## 10. Feature Implementation Standard

When implementing `Career`, `Question`, `Candidate`, `Assessment`, or `Result`, follow the established `Dimension` feature pattern:

- **Schema:** Zod validation, including positive integer ID coercion.
- **Query:** Server-side database access, soft-delete filters, and transactions where appropriate.
- **Action:** Authentication, validation, existence and authorization checks, typed results, and path revalidation.
- **Component:** Server Components by default, loading skeletons, empty states, and shared pagination.
- **Database:** Respect Prisma relations and constraints.
- **Verification:** Run type checking and linting; build when appropriate.

**Core principle:** Reuse established project conventions, enforce security on the server, preserve strict typing, and implement career scoring using explicit, validated, and consistently normalized dimension scores.