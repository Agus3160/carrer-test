# Plan de implementación: recomendador vocacional basado en conocimiento

## 1. Objetivo y alcance inicial

Construir una plataforma que obtenga un perfil explícito del estudiante —intereses, habilidades actuales, preferencias de actividades y estilos de trabajo, prioridades y restricciones— y lo compare con perfiles verificables de carreras universitarias. El resultado será un ranking útil para explorar opciones, acompañado de evidencias comprensibles y trade-offs.

La primera fase del catálogo contempla únicamente estas cuatro carreras:

1. Ingeniería Civil
2. Ingeniería Electromecánica
3. Ingeniería Informática
4. Ingeniería Industrial

El motor debe aceptar carreras nuevas como datos, sin requerir cambios a sus reglas principales. La primera versión usa JEV de TypeSafe para la decisión comparativa y la base de conocimiento versionada como contexto y fuente de explicaciones; no requiere entrenar un modelo con elecciones históricas.

La elección del enfoque también responde al tipo de decisión: los recomendadores basados en conocimiento recopilan preferencias explícitas y las contrastan con restricciones o similitud de atributos, una opción documentada para dominios complejos y decisiones de alta implicación como elegir una carrera. [Revisión de recomendadores basados en conocimiento](https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2024.1304439/full).

## Estado de implementación (16 de octubre de 2026)

La primera versión funcional ya cubre el recorrido público desde el inicio hasta el ranking y la consulta del catálogo. El motor consulta JEV mediante una pregunta `Choice`, versionada con la versión exacta del modelo, y ordena las carreras por la distribución de probabilidades devuelta. No depende del historial de otros estudiantes.

El seed contiene las cuatro carreras, 32 conceptos, 44 asignaturas de referencia y 22 preguntas. Los cursos son una muestra representativa, no la malla completa. Los vínculos derivados de fuentes ocupacionales están marcados como preliminares; las relaciones y su adaptación cultural todavía requieren validación de orientadores y referentes académicos.

| Área | Implementado | Pendiente para validar o ampliar |
|---|---|---|
| Catálogo | Civil, Electromecánica, Informática e Industrial, con cursos, conceptos, enlaces a planes y relaciones de trabajo. | Confirmar vigencia de cada plan, completar la malla y revisar los puentes entre cursos, actividades y ocupaciones. |
| Perfil | Intereses, materias, fortalezas percibidas y preferencias de trabajo, con respuesta neutral. Nombre opcional; no se pide CI ni correo. | Añadir prioridades y restricciones explícitas si se acuerdan con orientadores; probar redacción y duración con estudiantes. |
| Recomendación | JEV devuelve una distribución entre carreras; la aplicación conserva evidencia, trade-offs, cobertura cualitativa, cursos, fuentes y versión del modelo. | Validar en español y con perfiles locales; evaluar el ranking frente a casos revisados por orientadores. Los porcentajes no predicen resultados académicos. |
| Persistencia y administración | Guarda versiones de cuestionario/motor y evidencia por carrera. Panel para consultar orientaciones y candidatos y revisar relevancia/estado de vínculos. | Administrar versiones completas del catálogo, editar conceptos/fuentes/cursos y definir retención/consentimiento antes de un piloto real. |
| Interfaz | Inicio, cuestionario, resultados, impresión y catálogo público; panel autenticado para el equipo. | Usabilidad, accesibilidad, revisión legal/privacidad y piloto académico antes de producción. |

Las asignaturas y asociaciones son contenido inicial para desarrollo y revisión. La aplicación no debe presentarse como instrumento psicométrico, diagnóstico, probabilidad de éxito ni sustituto de orientación profesional.

## 2. Hallazgos de la búsqueda de datos

### Carreras y programas de estudio

Hay planes públicos utilizables para construir el catálogo inicial. Los nombres y áreas que siguen son una primera lectura; antes de publicar la orientación se debe confirmar con la dirección académica qué versión de cada plan está vigente.

| Carrera | Áreas y asignaturas representativas encontradas | Fuente del plan |
|---|---|---|
| Civil | Matemática y física; mecánica de materiales; geología, geotecnia e hidráulica; estructuras y hormigón; topografía y vías; obras hidráulicas; construcción y gestión de obras. | [Plan de estudios 2018](https://www.fiuni.edu.py/wp-content/uploads/2021/09/Plan-de-Estudios-Ing-Civil-2018.pdf) y [listado por semestres](https://www.fiuni.edu.py/284-2/). |
| Electromecánica | Matemática, física y diseño técnico; termodinámica y fluidos; circuitos y teoría electromagnética; máquinas, mecanismos y transferencia de calor; instrumentación, instalaciones, control, mantenimiento y energía. | [Malla 2018](https://www.fiuni.edu.py/wp-content/uploads/2019/04/MALLA-CURIC_-ELECTROMECANICA-2018.pdf) y [asignaturas por semestre](https://www.fiuni.edu.py/274-2/). |
| Informática | Programación y paradigmas; arquitectura de computadoras; algoritmos y estructuras de datos; redes, sistemas operativos y distribuidos; ingeniería de software; interacción persona-computadora; inteligencia artificial y áreas electivas. | [Malla curricular 2023](https://www.fiuni.edu.py/wp-content/uploads/2024/06/ING-INFORMATICA_Malla_2023_0001-1.pdf). El sitio también muestra material del plan 2015, por lo que debe prevalecer la versión vigente confirmada por la carrera. |
| Industrial | Sistemas de manufactura; operaciones y procesos industriales; instalaciones; planificación y control de producción; automatización; costos, proyectos, seguridad, ambiente y gestión de personas. | [Plan de estudios](https://www.fiuni.edu.py/wp-content/uploads/2024/01/Plan-de-Estudios-INGENIERIA-INDUSTRIAL.pdf) y [programa de Introducción a Ingeniería Industrial](https://www.fiuni.edu.py/wp-content/uploads/2024/12/Introducci%C3%B3n-a-la-Ingenier%C3%ADa-Industrial.pdf). |

El sitio institucional informó en 2026 la convocatoria para las cuatro carreras del alcance inicial: [convocatoria de ingreso 2026](https://www.fiuni.edu.py/2026/04/20/primera-evaluacion-parcial-del-curso-probatorio-de-admision-2026-se-realiza-con-361-postulantes-en-la-fiuni/). También hay perfiles profesionales públicos para algunas carreras, por ejemplo el [perfil, objetivos y campo laboral de Electromecánica](https://www.fiuni.edu.py/wp-content/uploads/2019/04/PERFIL-OBJETIVOS-CAMPO-LABORAL.pdf) y la [dirección y perfil de Civil](https://www.fiuni.edu.py/direccion-de-carrera-de-ingenieria-civil/). Son material de partida, pero el catálogo debe mantener el URL, versión y fecha de consulta para cada afirmación.

### Catálogos reutilizables para ocupaciones y afinidades

Se pueden reutilizar datos de ocupaciones en bloque en lugar de investigar una a una las relaciones entre cada profesión, habilidad y actividad:

- **O*NET Database:** publica tablas descargables en CSV/JSON con ocupaciones, intereses vocacionales RIASEC, habilidades, conocimientos, capacidades, actividades y contexto de trabajo, estilos de trabajo y tareas. Incluye vínculos entre varias de esas categorías. Puede aportar el perfil laboral de las ocupaciones relacionadas con cada carrera. [Catálogo y descargas de O*NET](https://www.onetcenter.org/database.html).
- **ESCO:** clasificación europea descargable y disponible en español, con ocupaciones, habilidades y conocimientos y relaciones entre ellos. Sirve para etiquetas y competencias en español y como vocabulario interoperable. [Descarga y servicios de ESCO](https://esco.ec.europa.eu/en/use-esco/download) y [descripción de ESCO](https://employment-social-affairs.ec.europa.eu/policies-and-activities/skills-and-qualifications/skills-jobs/european-skillscompetences-qualifications-and-occupations-esco_en).
- **O*NET Interest Profiler:** ofrece una forma corta de 60 preguntas y una variante de 30 preguntas en su documentación para desarrolladores; pregunta cuánto gusta o disgusta una actividad laboral y calcula áreas de interés RIASEC. Es una opción de referencia para elaborar el módulo de intereses, sujeta a revisar la licencia de la versión y su adaptación local. [Referencia del Interest Profiler](https://services.onetcenter.org/reference/mpp/ip) y [licencias de las herramientas](https://www.onetcenter.org/license_tools.html).

Estos catálogos **no contienen una equivalencia validada y directa entre cada carrera local y el perfil psicológico ideal de un estudiante**. O*NET refleja ocupaciones del mercado estadounidense; ESCO está orientado al mercado europeo. Se deben tomar como taxonomías de referencia y enriquecer/validar su mapeo a las carreras y al contexto local. Los estilos de trabajo describen conductas o preferencias laborales relacionadas con ocupaciones; no son un diagnóstico de personalidad.

La estrategia para evitar una investigación manual extensa es: importar las tablas públicas en bloque; vincular cada una de las cuatro carreras con un conjunto pequeño de ocupaciones/campos laborales; relacionar su plan de estudios con grupos de materias y competencias; y pedir revisión académica de esas cuatro relaciones. No hace falta escribir a mano un perfil desde cero para cada habilidad y cada carrera.

## 3. Modelo de conocimiento

### Perfil del estudiante

El cuestionario debe distinguir constructos que el prototipo actual mezcla en dimensiones genéricas:

- **Intereses:** qué actividades y problemas le gustaría explorar o realizar. Puede usarse el marco RIASEC como vocabulario inicial y preguntas situacionales, revisando derechos de reutilización y adecuación cultural.
- **Habilidades y capacidades actuales:** autoevaluación ligera y ejemplos de actividades realizadas. Se usa para describir fortalezas, nunca para excluir a quien todavía puede aprenderlas.
- **Preferencias de aprendizaje y trabajo:** por ejemplo, trabajo práctico o conceptual; diseño o análisis; actividades individuales o colaborativas; tareas estructuradas o abiertas; trabajo de campo, laboratorio, oficina o computadora.
- **Preferencias académicas:** gusto/interés por familias de materias, disposición a estudiar matemática/física/programación/química, y áreas que quiere conocer mejor. El interés debe separarse del rendimiento escolar.
- **Prioridades y restricciones:** entorno deseado, valores, ubicación o modalidad si resultan pertinentes, y elementos que la persona marca como imprescindibles frente a los que solo prefiere.
- **Incertidumbre:** respuesta neutral, no sabe o respuesta omitida. No convertirla en falta de capacidad ni en una señal negativa.

Evitar inferir que un tipo de personalidad “pertenece” a una carrera o predice éxito. En esta orientación, la personalidad se operacionaliza de manera limitada como preferencias de trabajo observables y declaradas, con lenguaje neutral y opción de revisar respuestas.

### Perfil de las carreras

Cada carrera tendrá un perfil compuesto por:

1. Plan curricular versionado: asignaturas, semestre, créditos/horas, prerrequisitos y estado vigente.
2. Grupos de contenido: matemática y modelado, computación, estructuras, energía y máquinas, manufactura, procesos, ambiente, gestión, entre otros.
3. Actividades de aprendizaje observables: programar, diseñar, modelar, experimentar, construir, inspeccionar, planificar, optimizar, mantener, comunicar y coordinar.
4. Competencias, conocimientos y capacidades abordados por el plan.
5. Campos laborales y ocupaciones relacionados, cada uno enlazado a las taxonomías O*NET/ESCO y marcado como revisado o pendiente.
6. Estilos/contextos de trabajo asociados a esas ocupaciones, presentados como señales orientativas y no como requisitos para ingresar a la carrera.
7. Fuente, versión, fecha de consulta, estado de revisión y responsable de cada dato importado o editado.

Las asignaturas no deben tratarse todas como indicadores de igual importancia. El plan y/o especialistas deben identificar contenidos troncales, electivos y de introducción; los programas analíticos y resultados de aprendizaje son mejores fuentes que el nombre de una materia cuando estén publicados.

## 4. Política aplicada en la primera versión

El flujo de recomendación se implementa en `features/form/lib/jev.ts` y `features/form/lib/evidence.ts`:

1. **Validar respuestas completas** y reconstruirlas desde las opciones activas del servidor.
2. **Preparar el contexto** con las respuestas, las áreas de conocimiento y las asignaturas representativas. El nombre opcional no se envía a JEV.
3. **Preguntar a JEV** mediante una única pregunta `Choice` con todas las carreras disponibles y sus perfiles estructurados. La instrucción prioriza intereses, materias y estilos de trabajo; una baja autopercepción de habilidad no debe tratarse como una razón para descartar una carrera.
4. **Validar la respuesta**: deben volver todas las opciones, probabilidades válidas que sumen aproximadamente 1 y una elección incluida en el catálogo. Si JEV no está disponible o la respuesta es inválida, no se genera un ranking alternativo silencioso.
5. **Ordenar por la distribución** de JEV y guardar la probabilidad de cada opción, el ranking y la versión exacta del modelo. Los porcentajes son la distribución comparativa entre las carreras; no son probabilidades de éxito o satisfacción futura.
6. **Construir explicaciones desde el catálogo**, sin prosa generada por el modelo: coincidencias, trade-offs, cobertura, cursos y fuentes.

Los perfiles y relaciones son decisiones iniciales de catálogo, no datos psicométricos validados. Deben revisarse con orientación vocacional y referentes académicos. Las explicaciones describen evidencias del catálogo; no afirman reconstruir el razonamiento interno de JEV.

El motor no tiene restricciones duras, comparación lado a lado ni diversidad para empates cercanos. La aplicación conserva preguntas personalizadas en el panel, pero solo las preguntas vinculadas mediante `seedKey` y códigos de concepto se muestran al estudiante.

## 5. Fases completadas y trabajo restante

| Fase | Estado y alcance |
|---|---|
| 0. Auditoría y definición | **Completada.** Se adoptó el recomendador basado en conocimiento, se separó interés de habilidad actual, se descartó el uso de pesos legados para el ranking y se evitó pedir CI/correo al estudiante. |
| 1. Catálogo | **Carga inicial completada.** El seed idempotente registra cuatro carreras, 32 conceptos y 44 asignaturas de referencia con fuentes. No representa las mallas completas; los puentes ocupacionales son preliminares y requieren revisión. |
| 2. Esquema y administración | **Primera versión completada.** Prisma almacena `KnowledgeConcept`, `CareerKnowledgeLink`, `CareerCourse`, versiones de evaluación y evidencia. El panel consulta evaluaciones/candidatos y permite ajustar relevancia/estado de vínculos. No administra todavía conceptos, cursos, fuentes o releases completos. |
| 3. Cuestionario | **Flujo inicial completado.** 22 preguntas separan interés, materia, fortaleza percibida y preferencia de trabajo. Se puede responder de forma anónima y elegir neutral. No hay guardado de progreso, prioridades/restricciones ni consentimiento configurable. |
| 4. Recomendador | **`jev-choice-v1` integrado.** JEV devuelve una distribución sobre carreras; el catálogo mantiene las explicaciones y las relaciones revisables. La versión del modelo y la distribución se guardan con cada evaluación. El comportamiento en español y los vínculos requieren validación con especialistas. |
| 5. Experiencia | **Recorrido inicial completado.** Inicio, formulario, resultados explicables, impresión, catálogo y fichas de carrera. No permite recuperar resultados públicos previos ni comparar carreras en paralelo. |
| 6. Calidad y piloto | **En curso.** Se automatizan contratos de respuesta y ordenamiento; falta validar recomendaciones con orientadores y estudiantes, evaluar el desempeño contextual en español y completar la política de consentimiento/retención antes de un piloto. |

### Trabajo para una siguiente fase

1. Confirmar la vigencia de los planes, completar las asignaturas y revisar cada relación con docentes/orientadores.
2. Completar la administración de conceptos, cursos, fuentes y versiones del catálogo, con trazabilidad de quién aprobó cada cambio.
3. Definir aviso/consentimiento, retención, eliminación y acceso a evaluaciones anteriores.
4. Acordar si se necesitan preguntas sobre prioridades o restricciones y cómo evitar que una preferencia común actúe como filtro excluyente.
5. Probar comprensión, duración, accesibilidad y neutralidad de las preguntas con estudiantes de la población prevista.
6. Revisar la calidad de la distribución y los rankings de JEV con perfiles de referencia acordados por expertos; fijar umbrales de baja confianza y revisar el comportamiento ante respuestas neutrales o contradictorias.
7. Ejecutar la batería automatizada, corregir defectos y documentar los resultados del piloto.

## 6. Alcance actual y siguientes ampliaciones

El esquema vigente agrega `KnowledgeConcept`, `CareerKnowledgeLink` y `CareerCourse`; `Assessment` y `Result` guardan versión y evidencia. `CareerDimension` permanece por compatibilidad histórica, pero no participa en las recomendaciones. La operación del panel mantiene metadatos de carreras aparte de sus asociaciones de conocimiento.

Siguiente trabajo de producto: confirmar el plan vigente y completar materias; administrar conceptos, cursos, fuentes y versiones desde el panel; decidir consentimiento, retención y acceso a resultados anteriores; añadir prioridades/restricciones si tienen una definición clara; probar accesibilidad y comprensión con estudiantes; y validar la política con expertos. No se deben convertir las asociaciones preliminares en hechos profesionales sin revisión.

## 7. Criterios de aceptación y límites

**Cubierto por esta implementación:** el seed expone las cuatro carreras que cuentan con asignaturas y relaciones; un estudiante anónimo completa el cuestionario; el ranking persiste respuestas y evidencia; cada razón enlaza a un concepto, curso o fuente; una baja autopercepción de habilidad no resta; la opción neutral no cuenta como cobertura informativa; el panel protege las consultas administrativas.

**Antes de un piloto o producción:** completar/verificar el catálogo, acordar consentimiento y retención, revisar las asociaciones con docentes y orientadores, validar el wording local, añadir pruebas de escenarios representativos, comprobar accesibilidad y documentar aprobación humana. El sistema es orientación exploratoria y no afirma tener validez psicométrica.

## 8. Referencias consultadas

- [Oferta para las cuatro carreras (convocatoria 2026)](https://www.fiuni.edu.py/2026/04/20/primera-evaluacion-parcial-del-curso-probatorio-de-admision-2026-se-realiza-con-361-postulantes-en-la-fiuni/)
- [Plan de Ingeniería Civil 2018](https://www.fiuni.edu.py/wp-content/uploads/2021/09/Plan-de-Estudios-Ing-Civil-2018.pdf) y [perfil/campo profesional](https://www.fiuni.edu.py/direccion-de-carrera-de-ingenieria-civil/)
- [Plan de Ingeniería Electromecánica 2018](https://www.fiuni.edu.py/wp-content/uploads/2019/04/MALLA-CURIC_-ELECTROMECANICA-2018.pdf) y [perfil/campo laboral](https://www.fiuni.edu.py/wp-content/uploads/2019/04/PERFIL-OBJETIVOS-CAMPO-LABORAL.pdf)
- [Malla de Ingeniería Informática 2023](https://www.fiuni.edu.py/wp-content/uploads/2024/06/ING-INFORMATICA_Malla_2023_0001-1.pdf)
- [Plan de Ingeniería Industrial](https://www.fiuni.edu.py/wp-content/uploads/2024/01/Plan-de-Estudios-INGENIERIA-INDUSTRIAL.pdf)
- [O*NET Database](https://www.onetcenter.org/database.html), [licencia de la base](https://www.onetcenter.org/license_db.html) y [licencia del Interest Profiler](https://www.onetcenter.org/license_tools.html)
- [TypeSafe: documentación de JEV](https://docs.typesafe.ai/introduction), [Choice y su distribución de probabilidades](https://docs.typesafe.ai/primitives/choice) y [modelos/versiones](https://docs.typesafe.ai/models)
- [ESCO: descargas/API](https://esco.ec.europa.eu/en/use-esco/download) y [clasificación de capacidades, competencias y ocupaciones](https://employment-social-affairs.ec.europa.eu/policies-and-activities/skills-and-qualifications/skills-jobs/european-skillscompetences-qualifications-and-occupations-esco_en)
- [Revisión de enfoques de recomendación basados en conocimiento](https://www.frontiersin.org/journals/big-data/articles/10.3389/fdata.2024.1304439/full)

Fuentes web consultadas el 15 de octubre de 2026. Confirmar versiones académicas, licencias y disponibilidad de los datasets al iniciar la fase de importación.
