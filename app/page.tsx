import Link from "next/link";
import {
  ArrowRightIcon,
  CompassIcon,
  GaugeIcon,
  ListChecksIcon,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const features = [
  {
    icon: ListChecksIcon,
    title: "Preguntas por dimensiones",
    description:
      "Preguntas de opción única, múltiple, escala y texto agrupadas por dimensión vocacional.",
  },
  {
    icon: GaugeIcon,
    title: "Cálculo por pesos",
    description:
      "Cada carrera pondera las dimensiones para obtener una compatibilidad del 1 al 100.",
  },
  {
    icon: CompassIcon,
    title: "Resultado inmediato",
    description:
      "Conoce tu mayor compatibilidad y guarda tu resultado para futuras consultas.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="flex items-center gap-2 font-semibold">
          <CompassIcon className="size-5 text-primary" />
          CheckCareer
        </span>
        <Button variant="ghost" nativeButton={false} render={<Link href="/auth/signin" />}>
          Acceso administrativo
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <Badge variant="secondary">Test de orientación vocacional</Badge>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Descubre qué carrera encaja contigo
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Responde un test basado en dimensiones vocacionales y obtén tu
          porcentaje de compatibilidad con cada carrera.
        </p>
        <Button size="lg" nativeButton={false} render={<Link href="/form" />}>
          Comenzar el test
          <ArrowRightIcon />
        </Button>

        <div className="mt-8 grid w-full max-w-3xl gap-4 text-left sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} size="sm">
              <CardHeader>
                <feature.icon className="size-5 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
