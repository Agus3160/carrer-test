import type {
  AnswersMap,
  CareerKnowledgeProfile,
  CareerResult,
  FormQuestion,
  RecommendationEvidence,
  RecommendationSource,
} from "./types";

type CareerEvidence = Omit<CareerResult, "rank" | "jevProbability">;

const EVIDENCE_KIND_ORDER = {
  INTEREST: 4,
  SUBJECT: 3,
  STRENGTH: 2,
  WORK_STYLE: 1,
} as const;

const selectedOptionIds = (answer: AnswersMap[number] | undefined) => {
  if (!answer) return [];
  if (answer.type === "SINGLE_CHOICE" || answer.type === "SCALE")
    return answer.optionId === null ? [] : [answer.optionId];
  if (answer.type === "MULTIPLE_CHOICE") return answer.optionIds;
  return [];
};

const sourceKey = (source: RecommendationSource) =>
  `${source.name}|${source.url}`;

/** Builds grounded explanations and coverage; JEV supplies the career ranking. */
export const buildKnowledgeEvidence = (
  careers: CareerKnowledgeProfile[],
  questions: FormQuestion[],
  answers: AnswersMap,
): CareerEvidence[] => {
  const questionByConcept = new Map<string, FormQuestion>();
  const selectedSignals = new Map<
    string,
    { value: number; response: string; kind: FormQuestion["kind"] }
  >();

  for (const question of questions) {
    for (const option of question.options) {
      for (const code of option.conceptCodes) questionByConcept.set(code, question);
    }

    for (const optionId of selectedOptionIds(answers[question.id])) {
      const option = question.options.find((item) => item.id === optionId);
      if (!option) continue;
      for (const code of option.conceptCodes) {
        questionByConcept.set(code, question);
        selectedSignals.set(code, {
          value: option.value,
          response: option.text,
          kind: question.kind,
        });
      }
    }
  }

  const knownConcepts = new Set(questionByConcept.keys());
  return careers.map((career) => {
    const applicable = career.knowledgeLinks.filter((link) =>
      knownConcepts.has(link.concept.code),
    );
    const coverageWeight = applicable.reduce(
      (sum, link) => sum + Math.max(0, link.relevance),
      0,
    );
    const evidence: RecommendationEvidence[] = [];

    for (const link of applicable) {
      const signal = selectedSignals.get(link.concept.code);
      const question = questionByConcept.get(link.concept.code);
      if (!signal || !question) continue;

      const courseNames = career.courses
        .filter((course) => course.conceptCodes.includes(link.concept.code))
        .map((course) => course.name)
        .slice(0, 2);
      const item = {
        conceptCode: link.concept.code,
        label: link.concept.label,
        kind: signal.kind,
        response: signal.response,
        rationale: link.rationale,
        courseNames,
        sourceName: link.sourceName,
        sourceUrl: link.sourceUrl,
      };

      if (signal.value > 0) {
        evidence.push({ ...item, relation: "coincide" });
      } else if (signal.value < 0 && signal.kind !== "STRENGTH") {
        evidence.push({ ...item, relation: "explorar" });
      }
    }

    const coverage = coverageWeight
      ? applicable.reduce((sum, link) => {
          const signal = selectedSignals.get(link.concept.code);
          return sum + (signal && signal.value !== 0 ? Math.max(0, link.relevance) : 0);
        }, 0) / coverageWeight
      : 0;
    const positiveEvidence = evidence
      .filter((item) => item.relation === "coincide")
      .sort(
        (a, b) =>
          EVIDENCE_KIND_ORDER[b.kind] - EVIDENCE_KIND_ORDER[a.kind] ||
          a.label.localeCompare(b.label, "es"),
      );
    const tradeoffs = evidence.filter((item) => item.relation === "explorar");
    const courses = [
      ...new Set(positiveEvidence.flatMap((item) => item.courseNames)),
    ].slice(0, 4);
    const sourcesByKey = new Map<string, RecommendationSource>();
    for (const link of career.knowledgeLinks) {
      if (link.sourceName && link.sourceUrl) {
        const source = { name: link.sourceName, url: link.sourceUrl, version: null };
        sourcesByKey.set(sourceKey(source), source);
      }
    }
    for (const course of career.courses) {
      const source = {
        name: course.sourceName,
        url: course.sourceUrl,
        version: course.sourceVersion,
      };
      sourcesByKey.set(sourceKey(source), source);
    }

    const coverageLabel: CareerResult["coverageLabel"] =
      coverage >= 0.75 ? "Amplia" : coverage >= 0.45 ? "Moderada" : "Inicial";
    const summary = positiveEvidence.length
      ? `Tus respuestas muestran interés en ${positiveEvidence
          .slice(0, 2)
          .map((item) => item.label.toLowerCase())
          .join(" y ")}.`
      : tradeoffs.length
        ? "Algunas de tus preferencias difieren de las áreas destacadas; revisa los motivos y decide qué te interesa explorar."
        : "Todavía no aparecen señales suficientes para destacar una coincidencia concreta.";
    const opportunities = tradeoffs
      .slice(0, 3)
      .map((item) =>
        item.courseNames.length
          ? `Marcaste poco interés actual en ${item.label.toLowerCase()}, presente en ${item.courseNames.join(" y ")}.`
          : `Marcaste poco interés actual en ${item.label.toLowerCase()}.`,
      );
    if (coverage < 0.45 && opportunities.length === 0)
      opportunities.push(
        "Hay pocas respuestas relacionadas con este perfil; completa más preguntas para comparar con mayor contexto.",
      );

    return {
      careerId: career.id,
      careerName: career.name,
      description: career.description,
      coverage,
      coverageLabel,
      summary,
      evidence: [...positiveEvidence, ...tradeoffs].slice(0, 7),
      opportunities,
      courses,
      sources: [...sourcesByKey.values()].slice(0, 8),
      matchedConceptCodes: positiveEvidence.map((item) => item.conceptCode),
    };
  });
};

export const applyJevProbabilities = (
  evidence: CareerEvidence[],
  probabilities: Map<number, number>,
): CareerResult[] =>
  evidence
    .map((item) => {
      const jevProbability = probabilities.get(item.careerId);
      if (jevProbability === undefined)
        throw new Error("JEV no devolvió una probabilidad para cada carrera");
      return { ...item, jevProbability };
    })
    .sort(
      (a, b) =>
        b.jevProbability - a.jevProbability ||
        a.careerName.localeCompare(b.careerName, "es"),
    )
    .map((item, index) => ({ ...item, rank: index + 1 }));
