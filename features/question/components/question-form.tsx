"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "@/shared/components/ui/toast";
import { createQuestion, updateQuestion } from "../actions/question.actions";
import { QuestionBody, QuestionSchema } from "../schemas/question.schema";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectGroup,
} from "@/shared/components/ui/select";
import { isChoiceQuestionType, QuestionTypeItems } from "../lib/form.utils";

type DimensionOption = {
  id: number;
  name: string;
};

type Props = {
  questionId?: number;
  dimensions: DimensionOption[];
  defaultValues?: QuestionBody;
};

const buildDefaultValues = (
  dimensions: DimensionOption[],
  defaultValues?: QuestionBody,
): QuestionBody =>
  defaultValues ?? {
    text: "",
    description: "",
    dimensionId: dimensions[0]?.id ?? 0,
    type: "SINGLE_CHOICE",
    options: [
      { text: "", value: 1 },
      { text: "", value: 0 },
    ],
  };

export const QuestionForm = ({
  questionId,
  dimensions,
  defaultValues,
}: Props) => {
  const router = useRouter();
  const isEditing = questionId !== undefined;

  const form = useForm<QuestionBody>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: buildDefaultValues(dimensions, defaultValues),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const type = useWatch({ control: form.control, name: "type" });
  const showOptions = isChoiceQuestionType(type);
  const optionsError = form.formState.errors.options?.message;

  const dimensionItems = dimensions.map((dimension) => ({
    label: dimension.name,
    value: String(dimension.id),
  }));

  const onSubmit = async (body: QuestionBody) => {
    const payload: QuestionBody = {
      ...body,
      options: isChoiceQuestionType(body.type) ? body.options : [],
    };

    const res = isEditing
      ? await updateQuestion(questionId, payload)
      : await createQuestion(payload);

    if (!res.success) {
      toast.add({
        type: "error",
        description: res.errors?.[0] ?? res.message ?? "Ocurrió un error",
      });
      return;
    }

    toast.add({ type: "success", description: res.message });
    router.push("/panel/questions");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar pregunta" : "Nueva pregunta"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza el enunciado, la dimensión y las opciones."
            : "Registra una nueva pregunta para las evaluaciones."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="question-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-6">
            <Controller
              control={form.control}
              name="text"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Enunciado*</FieldLabel>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="Escribe la pregunta"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Contexto o explicación de la pregunta"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="dimensionId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Dimensión*</FieldLabel>

                  <Select
                    name={field.name}
                    items={dimensionItems}
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Seleccione una dimensión" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {dimensionItems.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Tipo de pregunta*
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    items={QuestionTypeItems}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {QuestionTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {dimensions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay dimensiones activas. Crea una dimensión primero.
              </p>
            )}
            {showOptions && (
              <div className="flex flex-col gap-4 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Opciones</p>
                    <p className="text-sm text-muted-foreground">
                      Agrega al menos 2 opciones y su valor de puntaje.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ text: "", value: 0 })}
                  >
                    <PlusIcon />
                    Agregar
                  </Button>
                </div>
                <Separator />
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Controller
                        name={`options.${index}.text`}
                        control={form.control}
                        render={({ field: input, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              placeholder={`Opción ${index + 1}`}
                              value={input.value}
                              onChange={input.onChange}
                              onBlur={input.onBlur}
                              ref={input.ref}
                            />
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    <div className="w-28">
                      <Controller
                        name={`options.${index}.value`}
                        control={form.control}
                        render={({ field: input, fieldState }) => (
                          <Field>
                            <Input
                              type="number"
                              min={0}
                              max={1000}
                              step={0.1}
                              placeholder="Valor"
                              aria-label={`Valor de la opcion ${index + 1}`}
                              value={input.value}
                              onChange={(v) =>
                                input.onChange(Number(v.target.value))
                              }
                              onBlur={input.onBlur}
                              ref={input.ref}
                            />
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar opción ${index + 1}`}
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
                {optionsError && <FieldError>{optionsError}</FieldError>}
              </div>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/panel/questions" />}
        >
          Cancelar
        </Button>
        <Button
          form="question-form"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear pregunta"}
        </Button>
      </CardFooter>
    </Card>
  );
};
