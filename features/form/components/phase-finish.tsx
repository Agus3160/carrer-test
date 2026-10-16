"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2Icon, HomeIcon, PrinterIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useFormContext } from "./form-provider";

export const PhaseFinish = () => {
  const { candidate, results, reset } = useFormContext();
  const router = useRouter();
  const topCareer = results[0] ?? null;

  const handleHome = () => {
    reset();
    router.push("/");
  };

  return (
    <Card id="printable-result" className="w-full border-0 bg-card/90 shadow-[0_24px_80px_oklch(0_0_0/0.24)] ring-1 ring-border/80">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <CheckCircle2Icon className="size-6 text-primary" />
        </div>
        <CardTitle>Tu orientación está lista{candidate.name ? `, ${candidate.name}` : ""}</CardTitle>
        <CardDescription>
          {topCareer
            ? `Tu primera recomendación es ${topCareer.careerName}. Usa el ranking como punto de partida para seguir explorando.`
            : "Tus respuestas se guardaron correctamente."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Los porcentajes muestran la distribución de JEV entre estas opciones; no predicen tu rendimiento o éxito futuro. Puedes imprimir o guardar esta pantalla como PDF desde el diálogo de impresión de tu dispositivo.
        </p>
        <ol className="space-y-2">
          {results.map((career) => (
            <li key={career.careerId} className="rounded-xl border border-border p-3">
              <p className="font-medium">
                {career.rank}. {career.careerName} · {new Intl.NumberFormat("es-PY", { style: "percent", maximumFractionDigits: 1 }).format(career.jevProbability)}
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{career.summary}</p>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleHome}>
          <HomeIcon />
          Volver al inicio
        </Button>
        <Button onClick={() => window.print()}>
          <PrinterIcon />
          Imprimir o guardar PDF
        </Button>
      </CardFooter>
    </Card>
  );
};
