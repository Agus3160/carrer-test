import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Separator } from "@/shared/components/ui/separator";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { formatDateTime } from "@/shared/lib/format";
import { getCareerById } from "@/features/career/queries/career.queries";

type Props = PageProps<"/panel/carrer/[id]">;

const CareerDetailPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<EntitySkeleton />}>
        <CareerDetail params={params} />
      </Suspense>
    </div>
  );
};

const CareerDetail = async ({ params }: Pick<Props, "params">) => {
  const { id } = await params;
  const careerId = Number(id);

  if (!Number.isInteger(careerId) || careerId <= 0) notFound();

  const career = await getCareerById(careerId);
  if (!career) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <BackLink href="/panel/carrer" />
        <h1 className="text-2xl font-semibold">{career.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>
            Información registrada de la carrera #{career.id}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Nombre</p>
            <p className="text-sm text-muted-foreground">{career.name}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Descripción</p>
            <p className="text-sm text-muted-foreground">
              {career.description ?? "Sin descripción"}
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Pesos por dimensión</p>
            {career.careerDimensions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se asignaron dimensiones a esta carrera.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dimensión</TableHead>
                      <TableHead className="w-24 text-right">Peso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {career.careerDimensions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.dimension.name}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.weight}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Creada</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(career.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Última actualización</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(career.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            nativeButton={false}
            render={<Link href={`/panel/carrer/${career.id}/edit`} />}
          >
            <PencilIcon />
            Editar
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default CareerDetailPage;
