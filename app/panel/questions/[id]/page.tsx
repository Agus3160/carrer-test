import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDateTime } from "@/shared/lib/format";
import { getQuestionById } from "@/features/question/queries/question.queries";
import {
  isChoiceQuestionType,
  QuestionTypesLabels,
} from "@/features/question/lib/form.utils";

type Props = PageProps<"/panel/questions/[id]">;

const QuestionDetailPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<EntitySkeleton />}>
        <QuestionDetail params={params} />
      </Suspense>
    </div>
  );
};

const QuestionDetail = async ({ params }: Pick<Props, "params">) => {
  const { id } = await params;
  const questionId = Number(id);

  if (!Number.isInteger(questionId) || questionId <= 0) notFound();

  const question = await getQuestionById(questionId);
  if (!question) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <BackLink href="/panel/questions" />
        <h1 className="text-2xl font-semibold">Detalle de la pregunta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pregunta #{question.id}</CardTitle>
          <CardDescription>
            Información registrada de la pregunta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-foreground">
            {question.seedKey
              ? "Esta pregunta está incluida en el cuestionario y sus opciones están vinculadas al recomendador."
              : "Esta pregunta es administrativa y no se muestra en el cuestionario ni afecta las recomendaciones porque aún no está vinculada a conceptos."}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Enunciado</p>
            <p className="text-sm text-muted-foreground">{question.text}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Descripción</p>
            <p className="text-sm text-muted-foreground">
              {question.description ?? "Sin descripción"}
            </p>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Dimensión</p>
              <p className="text-sm text-muted-foreground">
                {question.dimension.name}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Tipo</p>
              <div>
                <Badge variant="secondary">
                  {QuestionTypesLabels[question.type]}
                </Badge>
              </div>
            </div>
          </div>
          {isChoiceQuestionType(question.type) && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Opciones</p>
                {question.options.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No se registraron opciones para esta pregunta.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opción</TableHead>
                          <TableHead className="w-24 text-right">
                            Valor
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {question.options.map((option) => (
                          <TableRow key={option.id}>
                            <TableCell>{option.text}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {option.value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Creada</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(question.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Última actualización</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(question.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            nativeButton={false}
            render={<Link href={`/panel/questions/${question.id}/edit`} />}
          >
            <PencilIcon />
            Editar
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default QuestionDetailPage;
