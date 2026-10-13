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
import { FieldGroup } from "@/shared/components/ui/field";
import { toast } from "@/shared/components/ui/toast";
import { DimensionBody, DimensionSchema } from "../schemas/dimension.schema";
import { createDimension, updateDimension } from "../actions/dimension.actions";

type Props = {
  dimensionId?: number;
  defaultValues?: DimensionBody;
};

export const DimensionForm = ({ dimensionId, defaultValues }: Props) => {
  const router = useRouter();
  const isEditing = dimensionId !== undefined;

  const form = useForm({
    resolver: zodResolver(DimensionSchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  const onSubmit = async (body: DimensionBody) => {
    const res = isEditing
      ? await updateDimension(dimensionId, body)
      : await createDimension(body);

    if (!res.success) {
      toast.add({
        type: "error",
        description: res.errors?.[0] ?? res.message ?? "Ocurrió un error",
      });
      return;
    }

    toast.add({ type: "success", description: res.message });
    router.push("/panel/dimension");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar dimensión" : "Nueva dimensión"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información de la dimensión."
            : "Registra una nueva dimensión para las evaluaciones."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="dimension-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-6">
            <TextField
              control={form.control}
              name="name"
              label="Nombre*"
              placeholder="Ej. Razonamiento lógico"
            />
            <TextareaField
              control={form.control}
              name="description"
              label="Descripción*"
              placeholder="Describe qué mide esta dimensión"
              rows={5}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/panel/dimension" />}
        >
          Cancelar
        </Button>
        <Button
          form="dimension-form"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear dimensión"}
        </Button>
      </CardFooter>
    </Card>
  );
};
