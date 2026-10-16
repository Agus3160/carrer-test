import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  CompassIcon,
  LightbulbIcon,
  SparklesIcon,
  UsersRoundIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

const features = [
  {
    icon: CompassIcon,
    title: "Empieza por tus intereses",
    description: "Explora los temas, las actividades y las formas de trabajar que hoy te llaman la atención.",
  },
  {
    icon: BookOpenCheckIcon,
    title: "Conoce carreras reales",
    description: "Compara tus respuestas con asignaturas publicadas y referencias de cada campo profesional.",
  },
  {
    icon: LightbulbIcon,
    title: "Entiende cada sugerencia",
    description: "Revisa coincidencias, aspectos por explorar y las fuentes detrás de cada recomendación.",
  },
];

const profileSignals = [
  { label: "Intereses", position: "left-0 top-[18%] sm:left-[7%]" },
  { label: "Materias", position: "right-0 top-[18%] sm:right-[7%]" },
  { label: "Preferencias", position: "left-0 bottom-[15%] sm:left-[7%]" },
  { label: "Actividades", position: "right-0 bottom-[15%] sm:right-[7%]" },
];

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden">
      <header className="animate-enter mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Brújula, inicio">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary transition-transform group-hover:rotate-12">
            <CompassIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Brújula</span>
        </Link>
        <nav aria-label="Navegación principal" className="flex items-center gap-1 rounded-full border border-border bg-card/80 p-1.5 backdrop-blur sm:gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/carreras" />}>
            Explorar carreras
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/auth/signin" />}
            className="hidden sm:inline-flex"
          >
            Acceso administrativo
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-8 pt-16 text-center sm:px-8 sm:pt-20">
        <div aria-hidden="true" className="landing-glow pointer-events-none absolute left-1/2 top-10 h-72 w-[min(82vw,70rem)] -translate-x-1/2 rounded-full" />
        <div className="animate-enter relative inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          <SparklesIcon className="size-3.5" aria-hidden="true" />
          Orientación vocacional
        </div>
        <h1 className="animate-enter animate-enter-delay-1 relative mt-6 max-w-6xl text-balance text-4xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-[5.5rem]">
          <span className="block">Tu próximo paso empieza con</span>
          <span className="block font-medium italic text-primary">lo que te mueve.</span>
        </h1>
        <p className="animate-enter animate-enter-delay-2 relative mt-7 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Descubre carreras que conectan con tus intereses y preferencias. Explora cada resultado con razones claras, asignaturas y fuentes para seguir investigando.
        </p>
        <div className="animate-enter animate-enter-delay-3 relative mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/form" />} className="h-12 px-6 text-sm">
            Empezar mi orientación
            <ArrowRightIcon />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/carreras" />} className="h-12 px-6 text-sm">
            Ver las carreras
          </Button>
        </div>
        <p className="animate-enter animate-enter-delay-3 mt-4 text-xs text-muted-foreground">
          Sin registro · Sin respuestas correctas o incorrectas
        </p>

        <div className="animate-enter relative mt-20 flex h-[22rem] w-full max-w-4xl items-center justify-center sm:mt-24 sm:h-[29rem]">
          <div aria-hidden="true" className="orbit-halo absolute size-[19rem] rounded-full sm:size-[26rem]" />
          <div aria-hidden="true" className="orbit-ring absolute size-[17rem] rounded-full border border-primary/50 sm:size-[23rem]" />
          <div aria-hidden="true" className="orbit-ring orbit-ring-secondary absolute size-[13rem] rounded-full border border-primary/15 sm:size-[18rem]" />
          <span aria-hidden="true" className="orbit-dot absolute left-[19%] top-[27%] size-3 rounded-full bg-primary sm:left-[22%] sm:top-[19%]" />
          <span aria-hidden="true" className="orbit-dot orbit-dot-small absolute right-[18%] top-[42%] size-2 rounded-full bg-primary sm:right-[16%]" />
          <span aria-hidden="true" className="orbit-dot absolute bottom-[22%] left-[28%] size-3 rounded-full bg-primary sm:bottom-[15%] sm:left-[25%]" />
          <div className="relative z-10 flex size-44 flex-col items-center justify-center rounded-full bg-background/80 text-center backdrop-blur sm:size-56">
            <CompassIcon className="mb-3 size-6 text-primary" aria-hidden="true" />
            <p className="text-2xl font-medium leading-none tracking-tight sm:text-3xl">Tu camino</p>
            <p className="mt-2 text-sm font-medium italic text-primary sm:text-base">empieza aquí</p>
          </div>
          {profileSignals.map((signal) => (
            <div
              key={signal.label}
              className={"absolute " + signal.position + " z-10 rounded-full border border-border bg-card/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-[0_8px_32px_oklch(0_0_0/0.25)] backdrop-blur sm:px-4 sm:py-2.5 sm:text-sm"}
            >
              <span className="mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" aria-hidden="true" />
              {signal.label}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mb-7 flex flex-col gap-2 sm:mb-9">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Una decisión informada
          </p>
          <h2 className="max-w-3xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
            Explora más que un resultado.
          </h2>
        </div>
        <div className="grid overflow-hidden rounded-[1.5rem] border border-border bg-card/35 md:grid-cols-3 md:divide-x md:divide-border">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={"animate-enter border-0 bg-transparent shadow-none ring-0 transition-colors hover:bg-primary/[0.035] " + (index < features.length - 1 ? "border-b border-border md:border-b-0" : "")}
            >
              <CardHeader className="gap-5 p-6 sm:p-8">
                <span className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <CardTitle className="text-xl font-medium tracking-tight">{feature.title}</CardTitle>
                  <CardDescription className="max-w-sm leading-6">{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
          <CompassIcon className="size-4 text-primary" aria-hidden="true" />
          Brújula
        </Link>
        <p className="flex items-center gap-2">
          <UsersRoundIcon className="size-3.5" aria-hidden="true" />
          Una herramienta para explorar, no para decidir por ti.
        </p>
      </footer>
    </main>
  );
}
