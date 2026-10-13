import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackLink } from "@/shared/components/back-link";
import { EntitySkeleton } from "@/shared/components/entity-skeleton";
import { CareerForm } from "@/features/career/components/career-form";
import { getCareerById } from "@/features/career/queries/career.queries";
import { getAllDimensions } from "@/features/dimension/queries/dimension.queries";

type Props = PageProps<"/panel/carrer/[id]/edit">;

const EditCareerPage = ({ params }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Suspense fallback={<EntitySkeleton />}>
        <EditCareerForm params={params} />
      </Suspense>
    </div>
  );
};

const EditCareerForm = async ({ params }: Pick<Props, "params">) => {
  const { id } = await params;
  const careerId = Number(id);

  if (!Number.isInteger(careerId) || careerId <= 0) notFound();

  const [career, dimensions] = await Promise.all([
    getCareerById(careerId),
    getAllDimensions(),
  ]);

  if (!career) notFound();

  return (
    <>
      <div className="flex items-center gap-2">
        <BackLink href="/panel/carrer" />
        <h1 className="text-2xl font-semibold">Editar carrera</h1>
      </div>
      <CareerForm
        careerId={career.id}
        dimensions={dimensions}
        defaultValues={{
          name: career.name,
          description: career.description ?? "",
          dimensions: career.careerDimensions.map((item) => ({
            dimensionId: item.dimensionId,
            weight: item.weight,
          })),
        }}
      />
    </>
  );
};

export default EditCareerPage;
