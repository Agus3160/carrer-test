import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { DimensionForm } from "@/features/dimension/components/dimension-form";
import { getDimensionById } from "@/features/dimension/queries/dimension.queries";

type Props = PageProps<"/panel/dimension/[id]/edit">;

const EditDimensionPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<EntitySkeleton />}>
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
        <BackLink href="/panel/dimension" />
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
