import { Skeleton } from "@/shared/components/ui/skeleton";

export const DimensionsTableSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <Skeleton key={index} className="h-12 w-full" />
    ))}
  </div>
);
