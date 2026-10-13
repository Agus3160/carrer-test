import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DimensionForm } from "@/features/dimension/components/dimension-form";
import { DimensionFormSkeleton } from "@/features/dimension/components/dimension-form-skeleton";
import { getDimensionById } from "@/features/dimension/queries/dimension.queries";

type Props = PageProps<"/panel/dimension/[id]/edit">;

const EditDimensionPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<DimensionFormSkeleton />}>
        <EditDimensionForm params={params} />
      </Suspense>
    </div>
  );
};

const EditDimensionForm = async ({ params }: Pick<Props, "params">) => {
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
          render={<Link href={`/panel/dimension/${dimension.id}`} />}
        >
          <ArrowLeftIcon />
        </Button>
        <h1 className="text-2xl font-semibold">Editar dimensión</h1>
      </div>
      <DimensionForm
        dimensionId={dimension.id}
        defaultValues={{
          name: dimension.name,
          description: dimension.description,
        }}
      />
    </>
  );
};

export default EditDimensionPage;
