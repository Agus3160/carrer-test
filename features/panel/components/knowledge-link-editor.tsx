"use client";

import { useState, type FormEvent } from "react";
import { SaveIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/ui/toast";
import { updateKnowledgeLink } from "../actions/knowledge.actions";

export const KnowledgeLinkEditor = ({
  id,
  relevance,
  status,
}: {
  id: number;
  relevance: number;
  status: "PRELIMINARY" | "REVIEWED";
}) => {
  const [weight, setWeight] = useState(String(relevance));
  const [reviewStatus, setReviewStatus] = useState(status);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const response = await updateKnowledgeLink(id, {
      relevance: Number(weight),
      status: reviewStatus,
    });
    setIsSaving(false);
    toast.add({
      type: response.success ? "success" : "error",
      description: response.message ?? "No se pudo actualizar",
    });
  };

  return (
    <form onSubmit={(event) => void save(event)} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Relevancia
        <Input
          type="number"
          min="0.25"
          max="2"
          step="0.05"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          className="h-9 w-24"
          aria-label="Relevancia de la relación"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Revisión
        <select
          value={reviewStatus}
          onChange={(event) => setReviewStatus(event.target.value as typeof reviewStatus)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Estado de revisión"
        >
          <option value="PRELIMINARY">Preliminar</option>
          <option value="REVIEWED">Revisada</option>
        </select>
      </label>
      <Button size="sm" type="submit" disabled={isSaving}>
        <SaveIcon />
        {isSaving ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
};
