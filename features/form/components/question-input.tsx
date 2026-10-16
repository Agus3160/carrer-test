"use client";

import { CheckIcon } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { AnswerValue, FormQuestion } from "../lib/types";

type Props = {
  question: FormQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
};

const ChoiceLabel = ({
  label,
  selected,
  multiple,
  name,
  value,
  onSelect,
}: {
  label: string;
  selected: boolean;
  multiple: boolean;
  name: string;
  value: number;
  onSelect: () => void;
}) => (
  <label
    className={cn(
      "group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
      "hover:border-primary/30 hover:bg-primary/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
      selected
        ? "border-primary/40 bg-primary/10 text-foreground"
        : "border-border bg-card",
    )}
  >
    <input
      className="peer sr-only"
      type={multiple ? "checkbox" : "radio"}
      name={name}
      value={value}
      checked={selected}
      onChange={onSelect}
    />
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center border text-primary",
        multiple ? "rounded-md" : "rounded-full",
        selected ? "border-primary bg-card" : "border-border bg-card",
      )}
    >
      {selected &&
        (multiple ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <span className="size-2 rounded-full bg-primary" />
        ))}
    </span>
    <span className="flex-1">{label}</span>
  </label>
);

export const QuestionInput = ({ question, value, onChange }: Props) => {
  if (question.type === "SINGLE_CHOICE")
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{question.text}</legend>
        {question.options.map((option) => (
          <ChoiceLabel
            key={option.id}
            label={option.text}
            name={`question-${question.id}`}
            value={option.value}
            multiple={false}
            selected={value?.type === "SINGLE_CHOICE" && value.optionId === option.id}
            onSelect={() => onChange({ type: "SINGLE_CHOICE", optionId: option.id })}
          />
        ))}
      </fieldset>
    );

  if (question.type === "MULTIPLE_CHOICE")
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{question.text}</legend>
        {question.options.map((option) => {
          const selected =
            value?.type === "MULTIPLE_CHOICE" && value.optionIds.includes(option.id);
          return (
            <ChoiceLabel
              key={option.id}
              label={option.text}
              name={`question-${question.id}`}
              value={option.value}
              multiple
              selected={selected}
              onSelect={() => {
                const current = value?.type === "MULTIPLE_CHOICE" ? value.optionIds : [];
                const optionIds = selected
                  ? current.filter((id) => id !== option.id)
                  : [...current, option.id];
                onChange({ type: "MULTIPLE_CHOICE", optionIds });
              }}
            />
          );
        })}
      </fieldset>
    );

  if (question.type === "SCALE")
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{question.text}</legend>
        {question.options.map((option) => (
          <ChoiceLabel
            key={option.id}
            label={option.text}
            name={`question-${question.id}`}
            value={option.value}
            multiple={false}
            selected={value?.type === "SCALE" && value.optionId === option.id}
            onSelect={() => onChange({ type: "SCALE", optionId: option.id })}
          />
        ))}
      </fieldset>
    );

  return (
    <Textarea
      rows={3}
      aria-label={question.text}
      placeholder="Escribe tu respuesta"
      value={value?.type === "TEXT" ? value.text : ""}
      onChange={(event) => onChange({ type: "TEXT", text: event.target.value })}
    />
  );
};
