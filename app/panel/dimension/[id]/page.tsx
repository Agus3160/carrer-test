import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
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
import { getDimensionById } from "@/features/dimension/queries/dimension.queries";
import { DimensionDetailSkeleton } from "@/features/dimension/components/dimension-detail-skeleton";
import { formatDateTime } from "@/shared/lib/format";

type Props = PageProps<"/panel/dimension/[id]">;

const DimensionDetailPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<DimensionDetailSkeleton />}>
        <DimensionDetail params={params} />
      </Suspense>
    </div>
  );
};

const DimensionDetail = async ({ params }: Pick<Props, "params">) => {
  const { id } = await params;
  const dimensionId = Number(id);

  if (!Number.isInteger(dimensionId) || dimensionId <= 0) notFound();

  const dimension = await getDimensionById(dimensionId);
  if (!dimension) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label="Volver"
          render={<Link href="/panel/dimension" />}
        >
          <ArrowLeftIcon />
        </Button>
        <h1 className="text-2xl font-semibold">{dimension.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>
            Información registrada de la dimensión #{dimension.id}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Nombre</p>
            <p className="text-sm text-muted-foreground">{dimension.name}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Descripción</p>
            <p className="text-sm text-muted-foreground">
              {dimension.description}
            </p>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Creada</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(dimension.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Última actualización</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(dimension.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            nativeButton={false}
            render={<Link href={`/panel/dimension/${dimension.id}/edit`} />}
          >
            <PencilIcon />
            Editar
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default DimensionDetailPage;
