"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2Icon, DownloadIcon, HomeIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { toast } from "@/shared/components/ui/toast";
import { useFormContext } from "./form-provider";

export const PhaseFinish = () => {
  const { results, reset } = useFormContext();
  const router = useRouter();
  const topCareer = results[0] ?? null;

  const handleHome = () => {
    reset();
    router.push("/");
  };

  const handleDownload = () => {
    toast.add({
      type: "info",
      description: "La descarga en PDF estará disponible próximamente",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2Icon className="size-6 text-primary" />
        </div>
        <CardTitle>¡Test completado!</CardTitle>
        <CardDescription>
          {topCareer
            ? `Tu resultado se guardó correctamente. Mayor compatibilidad: ${topCareer.careerName} (${topCareer.score}%).`
            : "Tu resultado se guardó correctamente."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Puedes descargar tu resultado en PDF o volver a la página de inicio.
        </p>
      </CardContent>
      <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleHome}>
          <HomeIcon />
          Volver al inicio
        </Button>
        <Button onClick={handleDownload}>
          <DownloadIcon />
          Descargar PDF
        </Button>
      </CardFooter>
    </Card>
  );
};
