import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  AnswersMap,
  CareerKnowledgeProfile,
  FormQuestion,
} from "./types";
import { applyJevProbabilities, buildKnowledgeEvidence } from "./evidence";

const createQuestion = (
  id: number,
  kind: FormQuestion["kind"],
  conceptCode: string,
  conceptLabel: string,
): FormQuestion => ({
  id,
  text: `Pregunta ${id}: ${conceptLabel}`,
  description: null,
  type: "SCALE",
  kind,
  dimension: { id: kind === "STRENGTH" ? 2 : 1, name: kind },
  options: [
    { id: id * 10, text: "Me interesa mucho", value: 1, conceptCodes: [conceptCode] },
    { id: id * 10 + 1, text: "No lo sé todavía", value: 0, conceptCodes: [conceptCode] },
    { id: id * 10 + 2, text: "No me atrae por ahora", value: -1, conceptCodes: [conceptCode] },
  ],
});

const createCareer = (
  id: number,
  name: string,
  concepts: { code: string; label: string }[],
): CareerKnowledgeProfile => ({
  id,
  name,
  description: `${name} description`,
  knowledgeLinks: concepts.map(({ code, label }) => ({
    relevance: 1,
    rationale: `${label} está relacionada con esta carrera.`,
    sourceName: "Fuente curricular",
    sourceUrl: "https://example.org/plan.pdf",
    concept: { code, label, type: "SUBJECT" },
  })),
  courses: concepts.map(({ code, label }) => ({
    name: `Asignatura ${label}`,
    conceptCodes: [code],
    sourceName: "Fuente curricular",
    sourceUrl: "https://example.org/plan.pdf",
    sourceVersion: "2026",
  })),
});

const selectOption = (
  question: FormQuestion,
  optionIndex: number,
): AnswersMap => ({
  [question.id]: {
    type: "SCALE",
    optionId: question.options[optionIndex].id,
  },
});

test("ordena carreras con la distribución de JEV y conserva evidencia del catálogo", () => {
  const interest = createQuestion(1, "INTEREST", "interest.code", "Programación");
  const careers = [
    createCareer(1, "Ingeniería Informática", [
      { code: "interest.code", label: "Programación" },
    ]),
    createCareer(2, "Ingeniería Civil", [
      { code: "subject.construction", label: "Construcción" },
    ]),
  ];
  const evidence = buildKnowledgeEvidence(careers, [interest], selectOption(interest, 0));
  const recommendations = applyJevProbabilities(
    evidence,
    new Map([[1, 0.8], [2, 0.2]]),
  );

  assert.equal(recommendations[0].careerName, "Ingeniería Informática");
  assert.equal(recommendations[0].rank, 1);
  assert.equal(recommendations[0].jevProbability, 0.8);
  assert.deepEqual(recommendations[0].matchedConceptCodes, ["interest.code"]);
  assert.deepEqual(recommendations[0].evidence[0].courseNames, [
    "Asignatura Programación",
  ]);
  assert.equal(recommendations[0].evidence[0].relation, "coincide");
});

test("una confianza baja en una habilidad no se presenta como trade-off", () => {
  const skill = createQuestion(2, "STRENGTH", "skill.math", "Confianza matemática");
  const [recommendation] = buildKnowledgeEvidence(
    [createCareer(1, "Ingeniería", [
      { code: "skill.math", label: "Confianza matemática" },
    ])],
    [skill],
    selectOption(skill, 2),
  );

  assert.deepEqual(recommendation.matchedConceptCodes, []);
  assert.deepEqual(recommendation.evidence, []);
  assert.equal(recommendation.opportunities.some((item) => /poco interés/i.test(item)), false);
});

test("el poco interés aparece como trade-off, no como coincidencia", () => {
  const interest = createQuestion(1, "INTEREST", "interest.field", "Trabajo de campo");
  const [recommendation] = buildKnowledgeEvidence(
    [createCareer(1, "Ingeniería Civil", [
      { code: "interest.field", label: "Trabajo de campo" },
    ])],
    [interest],
    selectOption(interest, 2),
  );

  assert.deepEqual(recommendation.matchedConceptCodes, []);
  assert.equal(recommendation.evidence[0].relation, "explorar");
  assert.match(recommendation.opportunities[0], /poco interés/i);
});

test("una respuesta neutral no crea coincidencias ni aumenta la cobertura", () => {
  const interest = createQuestion(1, "INTEREST", "interest.design", "Diseño");
  const [recommendation] = buildKnowledgeEvidence(
    [createCareer(1, "Ingeniería", [{ code: "interest.design", label: "Diseño" }])],
    [interest],
    selectOption(interest, 1),
  );

  assert.equal(recommendation.coverage, 0);
  assert.equal(recommendation.coverageLabel, "Inicial");
  assert.deepEqual(recommendation.evidence, []);
  assert.match(recommendation.opportunities[0], /pocas respuestas/i);
});
