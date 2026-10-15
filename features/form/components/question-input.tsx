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

const ChoiceOption = ({
  label,
  selected,
  multiple,
  onSelect,
}: {
  label: string;
  selected: boolean;
  multiple: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role={multiple ? "checkbox" : "radio"}
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-left text-sm transition-colors",
      "hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
      selected && "border-primary/40 bg-primary/5",
    )}
  >
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border",
        multiple ? "rounded-[4px]" : "rounded-full",
        selected ? "border-primary bg-primary/10" : "border-muted-foreground/40",
      )}
    >
      {selected &&
        (multiple ? (
          <CheckIcon className="size-3 text-primary" />
        ) : (
          <span className="size-2 rounded-full bg-primary" />
        ))}
    </span>
    <span className="flex-1">{label}</span>
  </button>
);

export const QuestionInput = ({ question, value, onChange }: Props) => {
  if (question.type === "SINGLE_CHOICE")
    return (
      <div className="flex flex-col gap-1">
        {question.options.map((option) => (
          <ChoiceOption
            key={option.id}
            label={option.text}
            multiple={false}
            selected={value?.type === "SINGLE_CHOICE" && value.optionId === option.id}
            onSelect={() => onChange({ type: "SINGLE_CHOICE", optionId: option.id })}
          />
        ))}
      </div>
    );

  if (question.type === "MULTIPLE_CHOICE")
    return (
      <div className="flex flex-col gap-1">
        {question.options.map((option) => {
          const selected =
            value?.type === "MULTIPLE_CHOICE" && value.optionIds.includes(option.id);

          return (
            <ChoiceOption
              key={option.id}
              label={option.text}
              multiple
              selected={selected}
              onSelect={() => {
                const current =
                  value?.type === "MULTIPLE_CHOICE" ? value.optionIds : [];
                const optionIds = selected
                  ? current.filter((id) => id !== option.id)
                  : [...current, option.id];
                onChange({ type: "MULTIPLE_CHOICE", optionIds });
              }}
            />
          );
        })}
      </div>
    );

  if (question.type === "SCALE")
    return (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const selected = value?.type === "SCALE" && value.optionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ type: "SCALE", optionId: option.id })}
              className={cn(
                "min-w-12 rounded-full border px-3 py-2 text-sm transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted/60",
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>
    );

  return (
    <Textarea
      rows={3}
      placeholder="Escribe tu respuesta"
      value={value?.type === "TEXT" ? value.text : ""}
      onChange={(event) => onChange({ type: "TEXT", text: event.target.value })}
    />
  );
};
