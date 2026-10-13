import { BackLink } from "@/shared/components/back-link";
import { DimensionForm } from "@/features/dimension/components/dimension-form";

const NewDimensionPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <BackLink href="/panel/dimension" />
        <h1 className="text-2xl font-semibold">Nueva dimensión</h1>
      </div>
      <DimensionForm />
    </div>
  );
};

export default NewDimensionPage;
