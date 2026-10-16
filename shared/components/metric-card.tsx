import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export const MetricCard = ({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}) => (
  <Card className="border-border bg-card shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
      <CardDescription>{label}</CardDescription>
      <Icon className="size-4 text-primary" aria-hidden="true" />
    </CardHeader>
    <CardContent>
      <CardTitle className="text-3xl">{value}</CardTitle>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
