"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, TextareaField } from "@/shared/components/form-fields";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FieldError, FieldGroup } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "@/shared/components/ui/toast";
import { CareerBody, CareerSchema } from "../schemas/career.schema";
import { createCareer, updateCareer } from "../actions/career.actions";

type DimensionOption = {
  id: number;
  name: string;
};

type Props = {
  careerId?: number;
  dimensions: DimensionOption[];
  defaultValues?: CareerBody;
};

export const CareerForm = ({ careerId, dimensions, defaultValues }: Props) => {
  const router = useRouter();
  const isEditing = careerId !== undefined;

  const form = useForm({
    resolver: zodResolver(CareerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      dimensions: dimensions.map((dimension) => ({
        dimensionId: dimension.id,
        weight:
          defaultValues?.dimensions.find(
            (item) => item.dimensionId === dimension.id,
          )?.weight ?? 0,
      })),
    },
  });

  const onSubmit = async (body: CareerBody) => {
    const res = isEditing
      ? await updateCareer(careerId, body)
      : await createCareer(body);

    if (!res.success) {
      toast.add({
        type: "error",
        description: res.errors?.[0] ?? res.message ?? "Ocurrió un error",
      });
      return;
    }

    toast.add({ type: "success", description: res.message });
    router.push("/panel/carrer");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar carrera" : "Nueva carrera"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información y los pesos por dimensión."
            : "Registra una nueva carrera y su peso por dimensión."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="career-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-6">
            <TextField
              control={form.control}
              name="name"
              label="Nombre*"
              placeholder="Ej. Ingeniería de Software"
            />
            <TextareaField
              control={form.control}
              name="description"
              label="Descripción (opcional)"
              placeholder="Describe la carrera"
              rows={4}
            />

            <div className="flex flex-col gap-4 rounded-xl border p-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Pesos por dimensión</p>
                <p className="text-sm text-muted-foreground">
                  Asigna un peso de 0 a 100 a cada dimensión. Usa 0 para
                  excluirla del cálculo.
                </p>
              </div>
              <Separator />
              {dimensions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay dimensiones activas. Crea una dimensión primero.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {dimensions.map((dimension, index) => {
                    const error =
                      form.formState.errors.dimensions?.[index]?.weight
                        ?.message;

                    return (
                      <div key={dimension.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor={`weight-${dimension.id}`}>
                            {dimension.name}
                          </Label>
                          <input
                            type="hidden"
                            {...form.register(
                              `dimensions.${index}.dimensionId`,
                              { valueAsNumber: true },
                            )}
                          />
                          <Input
                            id={`weight-${dimension.id}`}
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            className="w-28"
                            aria-invalid={Boolean(error)}
                            {...form.register(`dimensions.${index}.weight`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        {error && <FieldError>{error}</FieldError>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/panel/carrer" />}
        >
          Cancelar
        </Button>
        <Button
          form="career-form"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear carrera"}
        </Button>
      </CardFooter>
    </Card>
  );
};
