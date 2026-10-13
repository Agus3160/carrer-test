# AGENTS.md - Guía para agentes IA en CheckCareer

Este documento proporciona información estructurada para que agentes de IA trabajen eficientemente con el proyecto **CheckCareer** (test de vocación profesional basado en scoring por dimensiones, con porcentajes de compatibilidad por carrera).

## 1. Ecosistema del proyecto y herramientas utilizadas

### Tecnologías principales

- **Framework**: [Next.js 16.4.0](https://nextjs.org/) con App Router (React Server Components + Server Actions)
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/) con configuración estricta
- **Estilo/UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/jamiebuilds/tw-animate-css)
- **Componentes**: [shadcn/ui](https://ui.shadcn.com/) (base-nova) + [Base UI](https://base-ui.com/react/) + [lucide-react](https://lucideicons.com/)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) para validación
- **Autenticación**: Sessions con cookies HTTP-only + bcrypt para hashing de contraseñas (custom, no NextAuth)
- **Base de datos**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM 7.10.0](https://www.prisma.io/) con [Prisma Pg Adapter](https://www.prisma.io/docs/orm/overview/databases/postgresql#adapter)
- **Cliente Prisma**: Generado en `generated/prisma/` (output personalizado)
- **Utilidades**: [clsx/cn](https://github.com/lukeed/clsx), class-variance-authority (cva)
- **Linter/Formatter**: [ESLint 9](https://eslint.org/) + `eslint-config-next` 16.4.0
- **Package manager**: [pnpm 11.9.0](https://pnpm.io/)
- **Build/Dev**: Turbopack (`@tailwindcss/turbopack`) en desarrollo

### Scripts disponibles

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Configuración adicional

- **Alias de imports**: `@/*` → `./*` (tsconfig.json)
- **shadcn/ui aliases**: `@/shared/components`, `@/shared/lib/utils`, `@/shared/components/ui`, `@/shared/lib`, `@/shared/hooks`
- **RSC habilitado** (shadcn con RSC: true)
- **Entorno**: Cargado con `dotenv/config` (ver `.env`)

### 1.1 Comandos útiles (Prisma/DB)

```bash
# Generar cliente Prisma (tras cambios en schema.prisma)
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev
pnpm prisma migrate deploy

# Seed de base de datos
pnpm tsx prisma/seed.ts

# Explorar DB
pnpm prisma studio
```

## 2. Infraestructura

### 2.1 Estructura del proyecto

```text
checkcareer/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # Landing/home (placeholder Next.js)
│   ├── globals.css         # Tailwind v4 + tema light/dark + shadcn
│   ├── auth/
│   │   └── signin/
│   ├── panel/              # Área autenticada (dashboard/admin)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── dimension/      # CRUD de dimensiones (implementado)
│   └── proxy.ts
├── features/               # Feature-based (vertical slices)
│   ├── auth/
│   │   ├── actions/        # Server Actions (signin, signout)
│   │   ├── components/
│   │   └── schemas/        # Zod schemas
│   ├── dimension/
│   │   ├── actions/        # CRUD server actions
│   │   ├── components/     # UI components (table, form, row-actions)
│   │   ├── queries/        # Data fetch (server)
│   │   └── schemas/
│   └── panel/
│       └── components/     # NavBar, session gate
├── shared/                 # Código compartido transversal
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   └── pagination.tsx
│   ├── lib/                # Utils (prisma, session, result, pagination, env, format, password)
│   └── types/              # Tipos compartidos (ActionResult, Paginated)
├── prisma/
│   ├── schema.prisma       # Modelo de datos (core vocacional)
│   ├── migrations/         # Migraciones
│   └── seed.ts
├── generated/
│   └── prisma/             # Cliente Prisma generado
├── public/                 # Assets estáticos
├── .env                    # Variables de entorno (dev)
└── AGENTS.md               # Este archivo
```

### 2.2 Arquitectura y patrones

- **Feature-first**: Lógica organizada por dominio (`auth`, `dimension`, `panel`). Cada feature tiene `actions/`, `components/`, `queries/`, `schemas/`.
- **Server-first**: Uso extensivo de Server Components + Server Actions (`"use server"`). Cliente solo cuando necesario (formularios/interactividad).
- **Soft delete**: Campos `deletedAt` en entidades principales (Dimension, Career, Question, Candidate...). Consultas filtran `deletedAt: null`.
- **Resultados tipados**: `ActionResult<T>` (`shared/types/action-result.ts`) con helpers `result.ok/success/fail` (`shared/lib/result.ts`).
- **Paginación reutilizable**: Tipos `Paginated<T>`, helpers `resolvePagination`, `getPaginationMeta`, `getPageItems`, `buildPageHref` (`shared/lib/pagination.ts` + UI `shared/components/pagination.tsx`).
- **Sesiones custom**: Cookie HTTP-only, token aleatorio (hex 32), hash SHA256 con `SESSION_SECRET`, TTL configurable, revocación por `revokedAt`, índices en `expiresAt`/`userId`. Helpers en `shared/lib/session.ts` (`getSession`, `getSessionOrRedirect`, `createSession`, `logout`, cacheadas con React `cache`).
- **Validación**: Zod en schemas por feature. Coerción para IDs (`z.coerce.number().int().positive()`).
- **Prisma**: Cliente singleton con adapter Pg, cacheado global en dev. Output personalizado en `../generated/prisma`.

### 2.3 Variables de entorno

Requeridas (validadas con Zod en `shared/lib/env.ts`):

```env
DATABASE_URL=postgresql://...        # PostgreSQL
NODE_ENV=development|test|production
SESSION_SECRET=string               # Requerido (tiene default dev solo en schema, usar fuerte en prod)
SESSION_COOKIE_NAME=session         # Default: session
SESSION_TTL_MS=number               # Default: 2592000000 (30 días) - en .env actual 604800 (7 días)
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin123*
```


### 2.4 Base de datos y modelo de scoring (core del test vocacional)

El modelo está diseñado para un **test vocacional por dimensiones con scoring ponderado por carrera** (obtención de porcentaje/score por carrera para determinar compatibilidad).

#### Entidades principales

| Modelo | Campos clave | Propósito |
|---|---|---|
| `Candidate` | `id`, `name`, `ci` (unique), `email` (unique), soft delete | Candidato que realiza la evaluación |
| `Assessment` | `candidateId`, `completedAt`, `answers[]`, `results[]` | Instancia de test realizada (evaluación) |
| `Dimension` | `id`, `name`, `description`, soft delete, `questions[]`, `careerDimensions[]` | Dimensión psicológica/vocacional (eje de evaluación) |
| `Career` | `id`, `name` (unique), `description`, soft delete, `careerDimensions[]`, `results[]` | Carrera/profesión. Obtendrá **score/porcentaje** por Assessment |
| `CareerDimension` | `careerId`, `dimensionId`, `weight` (Float, default 1.0) | **Matriz de ponderación carrera-dimensión**. Define cuánto pesa cada dimensión para esa carrera (clave para scoring ponderado). |
| `Question` | `text`, `description`, `dimensionId`, `type` (`SINGLE_CHOICE|MULTIPLE_CHOICE|SCALE|TEXT`), `options[]`, `answers[]` | Pregunta asociada a una dimensión |
| `QuestionOption` | `text`, `value` (Float) | Opción con **valor numérico** (puntuación base de esa respuesta) |
| `Answer` | `questionId`, `questionOptionId?`, `value?` (Float), `text?`, `assessmentId?` | Respuesta dada en una Assessment. Usa `value` (o deriva de opción) para cálculo |
| `Result` | `assessmentId`, `careerId`, `score` (Float), `description?`, `@@unique([assessmentId,careerId])` | **Resultado por carrera** (score calculado). Aquí se almacena el porcentaje/compatibilidad por carrera. |
| `User`/`Session` | Auth admin/panel | Gestión de acceso al panel administrativo |

#### Lógica de scoring

Basado en el esquema:

1. Cada `Question` pertenece a una `Dimension` (`dimensionId`)
2. Cada `Career` tiene pesos por dimensión vía `CareerDimension` (`weight` por `(careerId, dimensionId)`). Esto permite que distintas carreras prioricen distintas dimensiones.
3. Respuestas: `Answer` apunta a `QuestionOption` (con `value`) o puede tener `value` directo (útil para SCALE/TEXT con normalización). El `value` de opción es la puntuación aportada por esa respuesta.
4. Una `Assessment` agrupa `Answer[]` de un `Candidate`.
5. `Result` almacena `score` (Float) por `(assessmentId, careerId)`. El modelo permite **un porcentaje/score por cada carrera** para determinar compatibilidad.

### 2.5 Rutas y navegación

Rutas App Router detectadas:

| Ruta | Descripción | Estado |
|---|---|---|
| `/` | Home/landing (placeholder Next.js) | Básico |
| `/auth/signin` | Login | Implementado |
| `/panel` | Dashboard autenticado | Implementado (layout + gate) |
| `/panel/dimension` | Listado dimensiones (paginado) | Implementado |
| `/panel/dimension/new` | Crear dimensión | Implementado |
| `/panel/dimension/[id]` | Detalle dimensión | Implementado |
| `/panel/dimension/[id]/edit` | Editar dimensión | Implementado |
| `/panel/carrer` | Carreras (ruta con 'r' simple) | **No implementado** (referenciado en NavBar) |
| `/panel/candidates` | Candidatos | No implementado |
| `/panel/questions`, `/panel/assessments`, `/panel/results`, `/test/*`, `/resultados/*` | No existen aún | Pendientes |


## 3. Elementos relevantes del proyecto

### 3.1 Convenciones de código

- **Path aliases**: Usar `@/` siempre (p.ej. `@/shared/lib/prisma`)
- **Server Actions**: Archivos `*.actions.ts` con `"use server"` al inicio. Retornan `ActionResult<T>`.
- **Queries**: `*.queries.ts` con `"server only"` (cuando usa DB directamente). Datos leídos desde Server Components.
- **Schemas**: `*.schema.ts` con Zod. Mensajes en español (coherente con UI).
- **Componentes**: `PascalCase.tsx`. Usar RSC por defecto; agregar `"use client"` solo si necesario (hooks, interactividad).
- **Soft delete**: Siempre filtrar `deletedAt: null` en reads (findMany/findFirst). Updates para borrar usan `deletedAt: new Date()`.
- **Revalidación**: Tras mutaciones, `revalidatePath` rutas afectadas (list + detail).
- **Paginación**: `searchParams.page` (string|string[]), parsear con `parsePage`/`resolvePagination`.
- **Fechas**: Formatear con `formatDateTime` (Intl es-ES) en `shared/lib/format.ts`.
- **Tipado estricto**: `strict: true` en TS. Evitar `any`.

### 3.2 Seguridad

- Sesiones: HTTP-only, `secure: true`, `sameSite: "strict"`, TTL, revocación, hash SHA256 con secret. Validación en cada acción sensible (`getSession()` / `getSessionOrRedirect()`).
- Hash passwords: `bcrypt` (cost 12 en seed/signin). Comparación con `compare`.
- Autorización: Panel protegido vía layout + `PanelSessionGate` (Suspense) y checks en Server Actions/Queries (`getSessionOrRedirect()`).
- Zod validation en inputs (previene datos inválidos).
- No exponer secrets: `.env` local, `env.ts` valida en runtime.
- Soft delete evita borrado físico accidental.

### 3.3 Estilo/UI

- Tailwind v4 con variables CSS (tema claro/oscuro). Usa clases semánticas (`text-muted-foreground`, etc.)
- shadcn/ui style `base-nova`, iconLibrary `lucide`.
- Español en UI (mensajes, labels). Codificación UTF-8.

### 3.4 Modelo de datos para el test vocacional (detalles de cálculo)

Para implementar correctamente **scoring por dimensiones → porcentaje por carrera**:

- `QuestionOption.value` (Float): Puntuación numérica de esa opción. Para preguntas tipo `SCALE` puede representar valor directo (0-10). Para `SINGLE_CHOICE`/`MULTIPLE_CHOICE` valores definidos según criterio.
- `CareerDimension.weight` (Float, default 1.0): Peso relativo de la `Dimension` para esa `Career`. Suma de pesos por carrera puede normalizarse (opcional) o usarse ponderado.
- `Answer.value` (Float, opcional): Permite override o valores para `TEXT`/casos especiales. Priorizar `questionOption.value` si existe.
- `Result.score` (Float): Score calculado por carrera en esa Assessment. Debe almacenarse (normalizado, p.ej. 0–100 o 0–1). El requisito pide **"porcentaje por cada carrera"** → recomendable 0–100.

**Fórmula sugerida (típica)**:

```text
Para cada Career C:
1. Por cada Dimension D con peso w_{C,D} (CareerDimension)
2. Calcular puntaje bruto de D: suma/media de values de Answers de Questions(D) en Assessment A (según tipo: SINGLE/MULTIPLE/SCALE)
3. Normalizar D a 0–100 (o escala común) según rango teórico (min/max posibles)
4. Score_C = (∑ w_{C,D} * norm_D) / (∑ w_{C,D}) * 100  (ponderado y normalizado a porcentaje)
5. Guardar en Result(score=Score_C, assessmentId=A.id, careerId=C.id)
```

## 4. Buenas prácticas base para cada petición al agente

### 4.1 Antes de codificar (investigación obligatoria)

1. **Entender contexto**: Leer AGENTS.md + schema.prisma + rutas relevantes (.next/app-path-routes-manifest.json si hay rutas nuevas).
2. **Explorar feature existente**: Si modificas `dimension`, mira `features/dimension/*` (patrones: actions con result, queries con server-only, schemas Zod, paginación).
3. **Revisar convenciones**: Usar mismos patrones (soft delete, revalidatePath, ActionResult, getSessionOrRedirect).
4. **Verificar librerías**: No asumir lib nueva. Comprobar package.json (Next 16, React 19, Zod 4, Prisma 7).
5. **Buscar referencias**: Usar grep/glob para entender uso antes de cambiar (evitar romper).
6. **Pensar en datos**: Para scoring (assessment/result) entender modelo completo antes de implementar.

### 4.2 Implementación

1. **Tipado estricto**: Inferir tipos de Zod/Prisma. Usar `@/generated/prisma/client` types (`Dimension`, etc.).
2. **Server-first**: Preferir RSC + Server Actions. `"use client"` solo cuando imprescindible.
3. **Validación doble**: Zod en schema + validación lógica (existencia, permisos) en actions.
4. **Transacciones**: Usar `prisma.$transaction` para operaciones múltiples/consistentes (p.ej. paginación count+findMany, creación con relaciones, cálculo de resultados).
5. **Acción atómica**: Cada Server Action hace una tarea clara. Retorna ActionResult con mensaje en español.
6. **Revalidación correcta**: Especificar paths correctos (`/panel/...`).
7. **Soft delete coherente**: Filtros en queries, updates en delete.
8. **Paginación**: Respetar `DEFAULT_PAGE_SIZE=8`, meta completa, UI compartida.
9. **UX**: Skeletons, estados vacíos, mensajes claros, accesibilidad básica.

### 4.3 Calidad y verificación

1. **Typecheck**: Ejecutar `npx tsc --noEmit` (no hay script, pero obligatorio). Detecta errores TS.
2. **Lint**: `pnpm lint` (eslint). Corregir warnings/errores.
3. **Build**: `pnpm build` para validar integración Next (recomendado ante cambios estructurales).
4. **Probar rutas**: Verificar auth + rutas protegidas, CRUD, paginación.
5. **No asumir tests**: No hay framework de tests visible. Si se añaden, buscar patrones existentes.
6. **Ver commits**: **NO commitear** a menos que usuario lo pida explícitamente (instrucción del sistema).

### 4.4 Estilo de respuesta del agente

- Conciso (< 4 líneas texto salvo detalle). Responder directo.
- Usar referencias `file_path:line_number` al citar código.
- Explicar comando no trivial antes de bash.
- No añadir comentarios innecesarios al código (regla: no añadir comentarios salvo pedido).
- Minimizar tokens, evitar preámbulo/postámbulo.

### 4.5 Patrones a seguir (ejemplo Dimension)

- Schema Zod: validación + `DimensionIdSchema = z.coerce.number().int().positive()`
- Query: `getDimensionsPage` con count+findMany transacción, filtra deletedAt, ordena desc
- Action: auth check (`getSession`), parse Zod, existencia, update con soft delete, revalidatePath
- Component: Server Component para tabla (lee datos), Suspense + Skeleton, paginación

Seguir exactamente este patrón para nuevas features (Career, Question, Candidate, Assessment, Result).
