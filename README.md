# CheckCareer

## Propósito

CheckCareer es una plataforma web de orientación vocacional. Recopila intereses, temas de estudio, habilidades percibidas y preferencias de trabajo; los contrasta con información estructurada de las carreras y presenta un ranking explicable.

## Enfoque del recomendador

El sistema combina una base de conocimiento revisable con **JEV de TypeSafe**. La base aporta perfiles de carreras, asignaturas y relaciones entre conceptos. JEV recibe las respuestas seleccionadas y esos perfiles, y devuelve una distribución de probabilidad entre las carreras disponibles. La aplicación ordena por esa distribución y conserva la versión del modelo utilizada.

Las explicaciones usan evidencias concretas del catálogo: actividades que interesan al estudiante, temas de asignaturas y tareas profesionales asociadas. Una baja confianza en habilidades actuales no debe reducir la afinidad estimada; las preferencias de personalidad se expresan como estilos de trabajo, no como etiquetas que determinen el futuro.

Los porcentajes describen la distribución comparativa de JEV dentro de las opciones evaluadas. No representan la probabilidad de éxito académico, permanencia, admisión ni satisfacción futura. Las coincidencias y aspectos para explorar se construyen desde las respuestas y los vínculos del catálogo; no se generan explicaciones libres con IA. Los vínculos ocupacionales actuales son preliminares y requieren validación local.

## Estado actual

La aplicación incluye una página pública, un cuestionario sin requisito de CI o correo, recomendaciones explicables, catálogo público de carreras y un panel protegido para revisar relaciones de conocimiento, cuestionarios y evaluaciones. El nombre opcional del candidato no se envía a JEV.

El catálogo contiene cuatro carreras de ingeniería. Las asignaturas son una selección de referencia, no una transcripción completa de cada plan. Las relaciones con actividades profesionales son preliminares y están marcadas para revisión local; el panel permite ajustar relevancia y estado.

El plan, las fuentes y las limitaciones del catálogo están documentados en [docs/PLAN_RECOMMENDER_SYSTEM.md](docs/PLAN_RECOMMENDER_SYSTEM.md).

## Stack

- Next.js App Router, React y TypeScript
- PostgreSQL con Prisma ORM 7 y adaptador `pg`
- pnpm

## Desarrollo local

1. Instala las dependencias con `pnpm install`.
2. Copia `.env.example` a `.env` y configura la base de datos, secretos administrativos y `JEV_API_KEY`. Puedes fijar otra versión con `JEV_MODEL`. No subas `.env` al repositorio.
3. Genera Prisma y aplica las migraciones:

   ```bash
   pnpm exec prisma generate
   pnpm exec prisma migrate dev
   ```

4. Carga el administrador, el catálogo, las relaciones y las preguntas base:

   ```bash
   pnpm exec tsx prisma/seed.ts
   ```

   El seed es idempotente y puede repetirse para actualizar los datos base.

5. Inicia la aplicación con `pnpm dev` y abre [http://localhost:3000](http://localhost:3000).

Para aplicar migraciones existentes en un entorno desplegado, usa `pnpm exec prisma migrate deploy`. Prisma Studio se abre con `pnpm exec prisma studio`.

## Flujo de recomendación

1. El servidor valida que se hayan respondido las preguntas activas.
2. Envía a JEV el perfil de respuestas y el catálogo de carreras, sin el nombre opcional.
3. JEV devuelve una probabilidad por carrera; el servidor valida que estén todas y que formen una distribución completa antes de ordenar.
4. Se guardan el ranking, la probabilidad de cada opción, la evidencia del catálogo y la versión exacta del modelo.
5. Si JEV falla, la aplicación pide reintentar; no cambia silenciosamente al motor anterior.

La integración está en `features/form/lib/jev.ts`; las evidencias del catálogo se preparan en `features/form/lib/evidence.ts`. El plan, las fuentes y las limitaciones están en [docs/PLAN_RECOMMENDER_SYSTEM.md](docs/PLAN_RECOMMENDER_SYSTEM.md).
