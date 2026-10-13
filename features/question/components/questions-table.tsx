import { EmptyState } from "@/shared/components/empty-state";
import { Pagination } from "@/shared/components/pagination";
import { RowActions } from "@/shared/components/row-actions";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDateTime } from "@/shared/lib/format";
import { deleteQuestion } from "../actions/question.actions";
import { getQuestionsPage } from "../queries/question.queries";
import { isChoiceQuestionType, QuestionTypesLabels } from "../lib/form.utils";

type Props = {
  searchParams: PageProps<"/panel/questions">["searchParams"];
};

export const QuestionsTable = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const {
    items,
    total,
    page: currentPage,
    totalPages,
  } = await getQuestionsPage(page);

  if (total === 0)
    return (
      <EmptyState
        title="Aún no hay preguntas"
        description="Crea tu primera pregunta para comenzar."
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enunciado</TableHead>
              <TableHead>Dimensión</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                Opciones
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Actualizado
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="max-w-xs truncate font-medium">
                  <span title={question.text}>{question.text}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {question.dimension.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">
                    {QuestionTypesLabels[question.type]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                  {isChoiceQuestionType(question.type)
                    ? question._count.options
                    : "—"}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDateTime(question.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RowActions
                      id={question.id}
                      name={question.text}
                      entityLabel="pregunta"
                      detailHref={`/panel/questions/${question.id}`}
                      editHref={`/panel/questions/${question.id}/edit`}
                      onDelete={deleteQuestion}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "pregunta" : "preguntas"} · página{" "}
          {currentPage} de {totalPages}
        </p>
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          basePath="/panel/questions"
        />
      </div>
    </div>
  );
};
