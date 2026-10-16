import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CompassIcon } from "lucide-react";
import { CareerPreviewCard } from "@/features/career/components/career-preview-card";
import { getPublicCareers } from "@/features/career/queries/public-career.queries";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Explorar carreras | Brújula",
  description: "Conoce las carreras, algunas asignaturas de referencia y las fuentes consultadas.",
};

export default function CareersPage() {
  return (
    <main className="min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
              <CompassIcon className="size-4" aria-hidden="true" />
            </span>
            Brújula
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 p-1.5">
            <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
              <ArrowLeftIcon />
              Inicio
            </Button>
            <Button nativeButton={false} render={<Link href="/form" />}>
              Hacer mi orientación
              <ArrowRightIcon />
            </Button>
          </div>
        </header>
        <section className="animate-enter relative max-w-4xl space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Catálogo inicial
          </p>
          <h1 className="text-balance text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Conoce las carreras que podrían{" "}
            <span className="italic text-primary">conectar contigo.</span>
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Revisa asignaturas representativas y fuentes curriculares. La orientación relaciona estos contenidos con lo que te interesa y con actividades profesionales de referencia.
          </p>
        </section>
        <Suspense fallback={<CareerGridSkeleton />}>
          <CareerGrid />
        </Suspense>
        <p className="max-w-4xl border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          El catálogo de asignaturas es una selección de referencia. Los vínculos entre materias, actividades, habilidades y preferencias son preliminares y no constituyen una evaluación de aptitud.
        </p>
      </div>
    </main>
  );
}

async function CareerGrid() {
  const careers = await getPublicCareers();
  return (
    careers.length > 0 ? (
      <section aria-label="Carreras disponibles" className="grid gap-4 md:grid-cols-2">
        {careers.map((career) => <CareerPreviewCard key={career.id} career={career} />)}
      </section>
    ) : (
      <p className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-muted-foreground">
        El catálogo se está preparando. Vuelve a consultar más adelante.
      </p>
    )
  );
}

function CareerGridSkeleton() {
  return (
    <div aria-label="Cargando carreras" role="status" className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-3xl bg-card ring-1 ring-border" />
      ))}
    </div>
  );
}
