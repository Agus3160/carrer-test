import Link from "next/link";
import { ArrowUpRightIcon, BookOpenIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { getPublicCareers } from "../queries/public-career.queries";

type Career = Awaited<ReturnType<typeof getPublicCareers>>[number];

export const CareerPreviewCard = ({ career }: { career: Career }) => {
  const subjects = career.knowledgeLinks
    .filter((link) => link.concept.type === "SUBJECT")
    .map((link) => link.concept.label)
    .slice(0, 4);

  return (
    <Card className="flex h-full flex-col rounded-3xl border-border/80 bg-card/75 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-card hover:shadow-[0_18px_55px_oklch(0_0_0/0.25)]">
      <CardHeader className="gap-2 p-5 sm:p-6">
        <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {career.courses.length} asignaturas de referencia
        </span>
        <CardTitle className="pt-1 text-xl">{career.name}</CardTitle>
        <CardDescription className="leading-6">
          {career.description ?? "Perfil de carrera en preparación."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 px-5 sm:px-6">
        {subjects.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpenIcon className="size-3.5" aria-hidden="true" />
              Temas curriculares
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {subjects.map((subject) => (
                <li key={subject} className="rounded-full border border-border bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground">
                  {subject}
                </li>
              ))}
            </ul>
          </section>
        )}
        {career.courses.length > 0 && (
          <p className="text-xs leading-5 text-muted-foreground">
            Algunas asignaturas: {career.courses.slice(0, 3).map((course) => course.name).join(" · ")}
          </p>
        )}
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <Button className="w-full justify-between" variant="outline" nativeButton={false} render={<Link href={`/carreras/${career.id}`} />}>
          Conocer la carrera
          <ArrowUpRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};
