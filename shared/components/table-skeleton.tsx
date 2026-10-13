import { Skeleton } from "@/shared/components/ui/skeleton";

type Props = {
  rows?: number;
};

export const TableSkeleton = ({ rows = 5 }: Props) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} className="h-12 w-full" />
    ))}
  </div>
);
