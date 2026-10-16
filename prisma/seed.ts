import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type ConceptSeed = {
  code: string;
  label: string;
  type:
    | "SUBJECT"
    | "INTEREST"
    | "SKILL"
    | "WORK_ACTIVITY"
    | "WORK_STYLE"
    | "WORK_CONTEXT"
    | "WORK_FIELD";
  description: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
};

const curriculumSources = {
  civil: {
    name: "Plan de Estudios de Ingeniería Civil",
    url: "https://www.fiuni.edu.py/wp-content/uploads/2021/09/Plan-de-Estudios-Ing-Civil-2018.pdf",
    version: "2018",
  },
  electromecanica: {
    name: "Malla Curricular de Ingeniería Electromecánica",
    url: "https://www.fiuni.edu.py/wp-content/uploads/2019/04/MALLA-CURIC_-ELECTROMECANICA-2018.pdf",
    version: "2018",
  },
  informatica: {
    name: "Malla Curricular de Ingeniería Informática",
    url: "https://www.fiuni.edu.py/wp-content/uploads/2024/06/ING-INFORMATICA_Malla_2023_0001-1.pdf",
    version: "2023",
  },
  industrial: {
    name: "Plan de Estudios de Ingeniería Industrial",
    url: "https://www.fiuni.edu.py/wp-content/uploads/2024/01/Plan-de-Estudios-INGENIERIA-INDUSTRIAL.pdf",
    version: "publicado 2024",
  },
};

const concepts: ConceptSeed[] = [
  ["subject.math", "Matemática", "SUBJECT", "Interés por modelar y resolver problemas cuantitativos.", curriculumSources.civil],
  ["subject.physics", "Física", "SUBJECT", "Interés por comprender fuerzas, energía y fenómenos físicos.", curriculumSources.civil],
  ["subject.programming", "Programación y algoritmos", "SUBJECT", "Interés por crear instrucciones, algoritmos y programas.", curriculumSources.informatica],
  ["subject.electronics", "Electricidad y electrónica", "SUBJECT", "Interés por circuitos, instalaciones y sistemas eléctricos.", curriculumSources.electromecanica],
  ["subject.mechanics", "Mecánica y máquinas", "SUBJECT", "Interés por mecanismos, materiales y sistemas mecánicos.", curriculumSources.electromecanica],
  ["subject.construction", "Construcción y estructuras", "SUBJECT", "Interés por estructuras, materiales y proyectos de construcción.", curriculumSources.civil],
  ["subject.water", "Hidráulica y recursos hídricos", "SUBJECT", "Interés por el movimiento y la gestión del agua.", curriculumSources.civil],
  ["subject.processes", "Procesos y producción", "SUBJECT", "Interés por procesos industriales y producción de bienes o servicios.", curriculumSources.industrial],
  ["subject.statistics", "Estadística y datos", "SUBJECT", "Interés por analizar datos para entender situaciones y apoyar decisiones.", curriculumSources.industrial],
  ["subject.management", "Gestión y organización", "SUBJECT", "Interés por planificar, organizar y mejorar proyectos y organizaciones.", curriculumSources.industrial],
  ["subject.environment", "Ambiente y sostenibilidad", "SUBJECT", "Interés por considerar impactos ambientales y soluciones sostenibles.", curriculumSources.civil],
  ["interest.solve", "Resolver problemas complejos", "INTEREST", "Gusto por analizar situaciones y encontrar soluciones.", "O*NET Interest Profiler"],
  ["interest.design", "Diseñar soluciones", "INTEREST", "Gusto por idear y diseñar sistemas, productos o estructuras.", "O*NET Occupation Data"],
  ["interest.build", "Construir y hacer tangible una idea", "INTEREST", "Gusto por convertir diseños en productos, obras o sistemas funcionales.", "O*NET Occupation Data"],
  ["interest.code", "Crear software y herramientas digitales", "INTEREST", "Gusto por programar y desarrollar soluciones informáticas.", "O*NET Occupation Data"],
  ["interest.investigate", "Investigar y aprender cómo funcionan las cosas", "INTEREST", "Gusto por investigar, experimentar y comprender sistemas.", "O*NET Interest Profiler"],
  ["interest.optimize", "Mejorar procesos y resultados", "INTEREST", "Gusto por encontrar maneras más eficientes de hacer el trabajo.", "O*NET Occupation Data"],
  ["interest.coordinate", "Coordinar proyectos y personas", "INTEREST", "Gusto por organizar actividades y trabajar hacia objetivos compartidos.", "O*NET Occupation Data"],
  ["activity.field", "Trabajo de campo", "WORK_ACTIVITY", "Actividades que pueden incluir visitas, mediciones o trabajo en sitios reales.", "O*NET Work Activities"],
  ["activity.maintain", "Diagnosticar y mantener equipos", "WORK_ACTIVITY", "Actividades vinculadas al diagnóstico y mantenimiento de sistemas técnicos.", "O*NET Work Activities"],
  ["activity.software", "Desarrollar y analizar sistemas de software", "WORK_ACTIVITY", "Actividades propias del análisis, diseño y desarrollo de software.", "O*NET occupation 15-1252.00"],
  ["activity.structures", "Diseñar y analizar estructuras", "WORK_ACTIVITY", "Actividad vinculada con el diseño y análisis de estructuras de ingeniería.", "O*NET occupation 17-2051.00"],
  ["activity.automation", "Automatizar sistemas", "WORK_ACTIVITY", "Integración de sensores, controles y equipos para operar sistemas.", "O*NET Work Activities"],
  ["activity.production", "Planificar y mejorar operaciones", "WORK_ACTIVITY", "Actividades asociadas a planificar y mejorar sistemas de producción y servicio.", "O*NET occupation 17-2112.00"],
  ["skill.quantitative", "Razonamiento cuantitativo", "SKILL", "Fortaleza percibida al trabajar con números, modelos o datos.", "O*NET Skills"],
  ["skill.spatial", "Visualización espacial", "SKILL", "Fortaleza percibida al interpretar formas, espacios y relaciones visuales.", "O*NET Abilities"],
  ["skill.technical", "Aprendizaje técnico práctico", "SKILL", "Confianza para aprender herramientas, equipos y procedimientos técnicos.", "O*NET Skills"],
  ["skill.programming", "Pensamiento computacional", "SKILL", "Confianza para descomponer problemas y expresar soluciones paso a paso.", "O*NET Skills"],
  ["skill.communication", "Comunicación y colaboración", "SKILL", "Fortaleza percibida para explicar ideas y colaborar con otras personas.", "O*NET Skills"],
  ["style.field", "Entorno práctico o de campo", "WORK_STYLE", "Preferencia por alternar análisis con actividades en espacios o equipos reales.", "O*NET Work Context"],
  ["style.analytical", "Tiempo para analizar en profundidad", "WORK_STYLE", "Preferencia por investigar y resolver problemas con concentración.", "O*NET Work Context"],
  ["style.collaborative", "Trabajo colaborativo", "WORK_STYLE", "Preferencia por coordinarse y aprender con otras personas.", "O*NET Work Context"],
].map(([code, label, type, description, source]) => {
  const isExternal = typeof source === "string";
  const sourceText = isExternal ? source : "";
  const sourceUrl = isExternal
    ? sourceText.includes("15-1252") ? "https://www.onetonline.org/link/summary/15-1252.00"
      : sourceText.includes("17-2051") ? "https://www.onetonline.org/link/summary/17-2051.00"
      : sourceText.includes("17-2112") ? "https://www.onetonline.org/link/summary/17-2112.00"
      : "https://www.onetcenter.org/database.html"
    : typeof source === "object" && source !== null && "url" in source
      ? String(source.url)
      : "";
  const sourceName = isExternal
    ? sourceText
    : typeof source === "object" && source !== null && "name" in source
      ? String(source.name)
      : "Fuente curricular";
  const sourceVersion = isExternal
    ? "O*NET 30.3; relación preliminar"
    : typeof source === "object" && source !== null && "version" in source
      ? String(source.version)
      : "currículum publicado";
  return {
    code: String(code),
    label: String(label),
    type: String(type) as ConceptSeed["type"],
    description: String(description),
    sourceName,
    sourceUrl,
    sourceVersion,
  };
});

type CareerSeed = {
  name: string;
  description: string;
  source: (typeof curriculumSources)[keyof typeof curriculumSources];
  conceptCodes: string[];
  courses: { semester?: number; code?: string; name: string; conceptCodes: string[] }[];
};

const careers: CareerSeed[] = [
  {
    name: "Ingeniería Civil",
    description: "Diseño y gestión de obras e infraestructuras, como estructuras, vías, obras hidráulicas y construcciones.",
    source: curriculumSources.civil,
    conceptCodes: ["subject.math", "subject.physics", "subject.construction", "subject.water", "subject.environment", "interest.solve", "interest.design", "interest.build", "interest.coordinate", "interest.investigate", "activity.field", "activity.structures", "skill.quantitative", "skill.spatial", "skill.technical", "skill.communication", "style.field", "style.collaborative"],
    courses: [
      { semester: 1, code: "001", name: "Álgebra", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 1, code: "002", name: "Análisis Matemático I", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 1, code: "003", name: "Física I", conceptCodes: ["subject.physics", "skill.quantitative"] },
      { semester: 4, code: "021", name: "Mecánica de Materiales I", conceptCodes: ["subject.physics", "subject.construction", "skill.quantitative"] },
      { semester: 5, code: "105", name: "Hidráulica", conceptCodes: ["subject.water", "subject.physics"] },
      { semester: 5, code: "136", name: "Topografía", conceptCodes: ["activity.field", "skill.spatial"] },
      { semester: 6, code: "112", name: "Cálculo de Estructuras", conceptCodes: ["subject.construction", "activity.structures", "skill.quantitative"] },
      { semester: 6, code: "107", name: "Geotecnia I", conceptCodes: ["subject.construction", "activity.field"] },
      { semester: 7, code: "139", name: "Vías de Comunicación I", conceptCodes: ["subject.construction", "activity.field"] },
      { semester: 9, code: "117", name: "Obras Hidráulicas", conceptCodes: ["subject.water", "subject.environment"] },
      { semester: 9, code: "129", name: "Programación y Control de Obras", conceptCodes: ["interest.coordinate", "subject.management", "skill.communication"] },
    ],
  },
  {
    name: "Ingeniería Electromecánica",
    description: "Integra sistemas mecánicos y eléctricos: diseño, instalación, control, mantenimiento y uso de energía.",
    source: curriculumSources.electromecanica,
    conceptCodes: ["subject.math", "subject.physics", "subject.electronics", "subject.mechanics", "interest.solve", "interest.design", "interest.build", "interest.investigate", "activity.maintain", "activity.automation", "skill.quantitative", "skill.technical", "skill.spatial", "style.field", "style.collaborative"],
    courses: [
      { semester: 1, code: "001", name: "Álgebra", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 1, code: "003", name: "Física I", conceptCodes: ["subject.physics", "skill.quantitative"] },
      { semester: 4, code: "021", name: "Mecánica de Materiales I", conceptCodes: ["subject.mechanics", "subject.physics"] },
      { semester: 5, code: "203", name: "Termodinámica", conceptCodes: ["subject.physics", "subject.mechanics"] },
      { semester: 5, code: "204", name: "Mecánica de Fluidos", conceptCodes: ["subject.physics", "subject.mechanics"] },
      { semester: 6, code: "206", name: "Mecanismos y Elementos de Máquinas", conceptCodes: ["subject.mechanics", "interest.design"] },
      { semester: 6, code: "207", name: "Circuitos Eléctricos", conceptCodes: ["subject.electronics", "subject.physics"] },
      { semester: 7, code: "216", name: "Mediciones e Instrumentación", conceptCodes: ["subject.electronics", "activity.automation", "skill.technical"] },
      { semester: 7, code: "217", name: "Máquinas Eléctricas I", conceptCodes: ["subject.electronics", "subject.mechanics"] },
      { semester: 9, code: "228", name: "Ingeniería de Control I", conceptCodes: ["activity.automation", "subject.electronics"] },
      { semester: 10, code: "230", name: "Higiene y Seguridad Industrial", conceptCodes: ["subject.management", "style.collaborative"] },
    ],
  },
  {
    name: "Ingeniería Informática",
    description: "Desarrollo y evaluación de software, computadoras, redes y sistemas de información.",
    source: curriculumSources.informatica,
    conceptCodes: ["subject.math", "subject.programming", "subject.statistics", "interest.solve", "interest.design", "interest.code", "interest.investigate", "activity.software", "skill.quantitative", "skill.programming", "skill.communication", "style.analytical", "style.collaborative"],
    courses: [
      { semester: 1, name: "Análisis Matemático I", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 1, name: "Comunicación Técnica", conceptCodes: ["skill.communication"] },
      { semester: 1, code: "302", name: "Arquitectura y Componentes de Computadoras", conceptCodes: ["subject.programming", "subject.electronics"] },
      { semester: 1, code: "301", name: "Programación I", conceptCodes: ["subject.programming", "skill.programming"] },
      { semester: 3, code: "311", name: "Paradigmas de la Programación I", conceptCodes: ["subject.programming", "activity.software"] },
      { semester: 3, name: "Diseño Digital I", conceptCodes: ["subject.programming", "interest.design"] },
      { semester: 4, name: "Redes de Computadoras I", conceptCodes: ["subject.programming", "activity.software"] },
      { semester: 4, name: "Algoritmos y Estructuras de Datos I", conceptCodes: ["subject.programming", "skill.programming", "interest.solve"] },
      { semester: 6, name: "Sistemas Operativos", conceptCodes: ["subject.programming", "activity.software"] },
      { semester: 7, name: "Interacción Hombre Máquina", conceptCodes: ["interest.design", "skill.communication"] },
      { semester: 8, code: "324", name: "Ingeniería de Software", conceptCodes: ["activity.software", "interest.coordinate", "skill.communication"] },
    ],
  },
  {
    name: "Ingeniería Industrial",
    description: "Diseño, análisis y mejora de sistemas de producción y servicios, considerando calidad, productividad, personas y ambiente.",
    source: curriculumSources.industrial,
    conceptCodes: ["subject.math", "subject.statistics", "subject.processes", "subject.management", "subject.environment", "interest.solve", "interest.optimize", "interest.coordinate", "interest.investigate", "activity.production", "skill.quantitative", "skill.communication", "style.collaborative", "style.analytical"],
    courses: [
      { semester: 1, name: "Álgebra", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 1, name: "Análisis Matemático I", conceptCodes: ["subject.math", "skill.quantitative"] },
      { semester: 3, code: "416", name: "Probabilidad y Estadística", conceptCodes: ["subject.statistics", "skill.quantitative"] },
      { semester: 3, code: "419", name: "Tecnología de los Materiales", conceptCodes: ["subject.processes", "subject.physics"] },
      { semester: 5, name: "Investigación de Operaciones I", conceptCodes: ["subject.statistics", "interest.optimize", "skill.quantitative"] },
      { semester: 6, name: "Gestión de Calidad", conceptCodes: ["subject.management", "activity.production"] },
      { semester: 7, code: "444", name: "Operaciones Industriales", conceptCodes: ["subject.processes", "activity.production"] },
      { semester: 7, code: "446", name: "Planificación y Control de la Producción", conceptCodes: ["subject.processes", "interest.optimize", "interest.coordinate"] },
      { semester: 8, name: "Fundamento de Ingeniería Ambiental", conceptCodes: ["subject.environment", "subject.processes"] },
      { semester: 9, code: "464", name: "Costos Industriales", conceptCodes: ["subject.statistics", "subject.management"] },
      { semester: 10, code: "473", name: "Formulación y Evaluación de Proyectos", conceptCodes: ["subject.management", "interest.coordinate", "skill.communication"] },
    ],
  },
];

const questionSeeds = [
  { key: "interest.solve", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto te atrae analizar un problema complejo hasta encontrar una solución?" },
  { key: "interest.design", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto te gustaría diseñar una solución, estructura o sistema?" },
  { key: "interest.build", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Qué tan atractivo te resulta construir o poner en marcha algo tangible?" },
  { key: "interest.code", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto te interesa crear programas o herramientas digitales?" },
  { key: "interest.investigate", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto disfrutas investigar cómo funcionan las cosas y probar ideas?" },
  { key: "interest.optimize", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto te interesa mejorar la eficiencia de un proceso o servicio?" },
  { key: "interest.coordinate", kind: "INTEREST", dimension: "Intereses y actividades", text: "¿Cuánto te gustaría planificar proyectos y coordinar tareas con otras personas?" },
  { key: "subject.math", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en matemática aplicada y resolución cuantitativa de problemas?" },
  { key: "subject.physics", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en física, fuerzas, energía y fenómenos naturales?" },
  { key: "subject.programming", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en programación, algoritmos y sistemas informáticos?" },
  { key: "subject.electronics", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en electricidad, electrónica y circuitos?" },
  { key: "subject.construction", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en construcción, estructuras y obras?" },
  { key: "subject.processes", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en procesos de producción y organización de operaciones?" },
  { key: "subject.environment", kind: "SUBJECT", dimension: "Materias y temas", text: "¿Qué interés tienes en ambiente, sostenibilidad y el impacto de proyectos?" },
  { key: "skill.quantitative", kind: "STRENGTH", dimension: "Fortalezas por desarrollar", text: "Al trabajar con números o datos, ¿cómo sientes tu confianza actual?" },
  { key: "skill.technical", kind: "STRENGTH", dimension: "Fortalezas por desarrollar", text: "¿Cómo sientes tu confianza para aprender herramientas o equipos técnicos?" },
  { key: "skill.spatial", kind: "STRENGTH", dimension: "Fortalezas por desarrollar", text: "¿Cómo sientes tu facilidad para imaginar formas, espacios o diagramas?" },
  { key: "skill.programming", kind: "STRENGTH", dimension: "Fortalezas por desarrollar", text: "¿Cómo sientes tu confianza para dividir un problema en pasos lógicos?" },
  { key: "skill.communication", kind: "STRENGTH", dimension: "Fortalezas por desarrollar", text: "¿Cómo sientes tu facilidad para explicar ideas y colaborar con otras personas?" },
  { key: "style.field", kind: "WORK_STYLE", dimension: "Preferencias de trabajo", text: "¿Cómo te sentirías alternando análisis con visitas, mediciones o trabajo en espacios reales?" },
  { key: "style.analytical", kind: "WORK_STYLE", dimension: "Preferencias de trabajo", text: "¿Cuánto prefieres tener tiempo para concentrarte y analizar un problema a fondo?" },
  { key: "style.collaborative", kind: "WORK_STYLE", dimension: "Preferencias de trabajo", text: "¿Qué tan importante es para ti trabajar y aprender en equipo?" },
] as const;

async function seed() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin123*";
  await prisma.user.upsert({
    where: { email },
    update: { name: "Admin", password: await bcrypt.hash(password, 12) },
    create: { email, name: "Admin", password: await bcrypt.hash(password, 12) },
  });

  const dimensions = new Map<string, number>();
  for (const name of [...new Set(questionSeeds.map((item) => item.dimension))]) {
    const description =
      name === "Fortalezas por desarrollar"
        ? "Autoevaluación orientativa. Una habilidad que hoy no esté desarrollada no reduce el encaje; puede aprenderse."
        : name === "Preferencias de trabajo"
          ? "Preferencias de entorno y colaboración; no son un diagnóstico de personalidad."
          : name === "Materias y temas"
            ? "Interés por temas que aparecen en los planes de estudio; no representa notas ni capacidad académica."
            : "Intereses por actividades y tareas que pueden aparecer en los estudios y el trabajo.";
    const existing = await prisma.dimension.findFirst({ where: { name } });
    const dimension = existing
      ? await prisma.dimension.update({ where: { id: existing.id }, data: { description, deletedAt: null } })
      : await prisma.dimension.create({ data: { name, description } });
    dimensions.set(name, dimension.id);
  }

  for (const concept of concepts) {
    await prisma.knowledgeConcept.upsert({
      where: { code: concept.code },
      update: {
        label: concept.label,
        type: concept.type,
        description: concept.description,
        sourceName: concept.sourceName,
        sourceUrl: concept.sourceUrl,
        sourceVersion: concept.sourceVersion,
        status: "PRELIMINARY",
      },
      create: {
        ...concept,
        status: "PRELIMINARY",
      },
    });
  }

  for (const seed of careers) {
    const career = await prisma.career.upsert({
      where: { name: seed.name },
      update: { description: seed.description, deletedAt: null },
      create: { name: seed.name, description: seed.description },
    });

    for (const code of seed.conceptCodes) {
      const concept = await prisma.knowledgeConcept.findUniqueOrThrow({ where: { code } });
      const isCurriculumConcept = concept.type === "SUBJECT";
      await prisma.careerKnowledgeLink.upsert({
        where: { careerId_conceptId: { careerId: career.id, conceptId: concept.id } },
        update: {
          relevance: concept.type === "SUBJECT" ? 1.25 : 1,
          rationale: isCurriculumConcept
            ? `La familia temática aparece en asignaturas del plan consultado: ${seed.source.name}.`
            : "Asociación orientativa con actividades o preferencias de trabajo; requiere revisión por orientadores y docentes locales.",
          sourceName: isCurriculumConcept ? seed.source.name : concept.sourceName,
          sourceUrl: isCurriculumConcept ? seed.source.url : concept.sourceUrl,
          sourceVersion: isCurriculumConcept ? seed.source.version : concept.sourceVersion,
          status: "PRELIMINARY",
        },
        create: {
          careerId: career.id,
          conceptId: concept.id,
          relevance: concept.type === "SUBJECT" ? 1.25 : 1,
          rationale: isCurriculumConcept
            ? `La familia temática aparece en asignaturas del plan consultado: ${seed.source.name}.`
            : "Asociación orientativa con actividades o preferencias de trabajo; requiere revisión por orientadores y docentes locales.",
          sourceName: isCurriculumConcept ? seed.source.name : concept.sourceName,
          sourceUrl: isCurriculumConcept ? seed.source.url : concept.sourceUrl,
          sourceVersion: isCurriculumConcept ? seed.source.version : concept.sourceVersion,
          status: "PRELIMINARY",
        },
      });
    }

    for (const course of seed.courses) {
      await prisma.careerCourse.upsert({
        where: { careerId_name: { careerId: career.id, name: course.name } },
        update: {
          semester: course.semester,
          code: course.code,
          conceptCodes: course.conceptCodes,
          sourceName: seed.source.name,
          sourceUrl: seed.source.url,
          sourceVersion: seed.source.version,
        },
        create: {
          careerId: career.id,
          ...course,
          sourceName: seed.source.name,
          sourceUrl: seed.source.url,
          sourceVersion: seed.source.version,
        },
      });
    }
  }

  for (const seed of questionSeeds) {
    const options = seed.kind === "STRENGTH"
      ? [
          { suffix: "high", text: "Hoy es una fortaleza para mí", value: 1 },
          { suffix: "maybe", text: "Aún la estoy desarrollando / no lo sé", value: 0 },
          { suffix: "low", text: "Hoy no me siento con confianza", value: -1 },
        ]
      : seed.kind === "WORK_STYLE"
        ? [
            { suffix: "high", text: "Me resulta atractivo", value: 1 },
            { suffix: "maybe", text: "No tengo una preferencia clara", value: 0 },
            { suffix: "low", text: "Preferiría evitarlo", value: -1 },
          ]
        : [
    { suffix: "high", text: "Me interesa mucho", value: 1 },
    { suffix: "maybe", text: "No lo sé todavía / me es indiferente", value: 0 },
    { suffix: "low", text: "No me atrae por ahora", value: -1 },
  ];
    const dimensionId = dimensions.get(seed.dimension)!;
    const question = await prisma.question.upsert({
      where: { seedKey: seed.key },
      update: {
        text: seed.text,
        description: seed.kind === "STRENGTH"
          ? "Responde según tu confianza actual. No tener todavía esta habilidad no resta puntos: se puede aprender."
          : seed.kind === "WORK_STYLE"
            ? "Esto describe una preferencia personal, no un tipo de personalidad ni una condición para ejercer."
            : "No hay respuestas correctas o incorrectas. Si aún no tienes una opinión, puedes indicarlo.",
        dimensionId,
        type: "SCALE",
        kind: seed.kind,
        deletedAt: null,
      },
      create: {
        seedKey: seed.key,
        text: seed.text,
        description: seed.kind === "STRENGTH"
          ? "Responde según tu confianza actual. No tener todavía esta habilidad no resta puntos: se puede aprender."
          : seed.kind === "WORK_STYLE"
            ? "Esto describe una preferencia personal, no un tipo de personalidad ni una condición para ejercer."
            : "No hay respuestas correctas o incorrectas. Si aún no tienes una opinión, puedes indicarlo.",
        dimensionId,
        type: "SCALE",
        kind: seed.kind,
      },
    });
    for (const option of options) {
      await prisma.questionOption.upsert({
        where: { code: `${seed.key}:${option.suffix}` },
        update: { text: option.text, value: option.value, conceptCodes: [seed.key] },
        create: {
          code: `${seed.key}:${option.suffix}`,
          text: option.text,
          value: option.value,
          conceptCodes: [seed.key],
          questionId: question.id,
        },
      });
    }
  }
}

seed()
  .then(() => console.log("Catálogo y administrador inicializados"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
