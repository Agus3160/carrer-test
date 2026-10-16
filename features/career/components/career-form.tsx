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
import { CareerBody, CareerSchema } from "../schemas/career.schema";
import { createCareer, updateCareer } from "../actions/career.actions";

type Props = {
  careerId?: number;
  defaultValues?: CareerBody;
};

export const CareerForm = ({ careerId, defaultValues }: Props) => {
  const router = useRouter();
  const isEditing = careerId !== undefined;

  const form = useForm({
    resolver: zodResolver(CareerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
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
            ? "Actualiza el nombre y la descripción que se muestran en el catálogo."
            : "Registra el nombre y la descripción. Para incluirla en el catálogo público y las recomendaciones, complétala en la base de conocimiento."}
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

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-foreground">
              Una carrera solo se muestra en el catálogo público y en las recomendaciones cuando tiene asignaturas y relaciones de conocimiento asociadas. Adminístralas en la{" "}
              <Link className="font-semibold underline underline-offset-4" href="/panel/knowledge">
                base de conocimiento
              </Link>
              .
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
