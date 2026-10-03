import type {
  ClassScheduleContent,
  DailyStudyContent,
  DeliveriesContent,
  MonthlyContent,
  PlannerAccent,
  PlannerContent,
  PlannerTemplateKey,
  ProjectContent,
  WeeklyContent,
} from "./types";

export const TEMPLATE_CATALOG: {
  key: PlannerTemplateKey;
  title: string;
  short: string;
  description: string;
  accent: PlannerAccent;
  format: string;
}[] = [
  {
    key: "monthly",
    title: "Vista mensual universitaria",
    short: "Mensual",
    description: "Calendario del mes, materias, fechas importantes, exámenes, trabajos, notas y seguimiento de hábitos.",
    accent: "sky",
    format: "Calendario + seguimiento",
  },
  {
    key: "deliveries_exams",
    title: "Entregas y exámenes",
    short: "Entregas",
    description: "Seguimiento de actividades por materia, prioridades, estados, exámenes, proyectos y pendientes importantes.",
    accent: "lavender",
    format: "Tablas académicas",
  },
  {
    key: "class_schedule",
    title: "Horario de clases",
    short: "Horario",
    description: "Horario semanal por horas con materias, profesores, recordatorios y objetivos de la semana.",
    accent: "sky",
    format: "Cuadrícula semanal",
  },
  {
    key: "daily_study",
    title: "Plan diario de estudio",
    short: "Diario",
    description: "Agenda por hora, objetivo del día, tareas, sesiones Pomodoro, prioridades, recordatorios y reflexión.",
    accent: "lavender",
    format: "Agenda diaria",
  },
  {
    key: "weekly",
    title: "Plan semanal",
    short: "Semanal",
    description: "Prioridades, tareas y notas por cada día, más hábitos, exámenes, pendientes y meta principal.",
    accent: "sage",
    format: "7 días + hábitos",
  },
  {
    key: "project",
    title: "Proyecto / trabajo especial",
    short: "Proyecto",
    description: "Objetivo, fecha límite, hitos y tablero de tareas para organizar un proyecto académico o personal.",
    accent: "sand",
    format: "Proyecto + tablero",
  },
];

export const ACCENTS: {
  key: PlannerAccent;
  label: string;
  dot: string;
}[] = [
  { key: "sky", label: "Azul académico", dot: "bg-sky-300" },
  { key: "lavender", label: "Lavanda", dot: "bg-violet-300" },
  { key: "rose", label: "Rosa", dot: "bg-rose-300" },
  { key: "sage", label: "Salvia", dot: "bg-emerald-300" },
  { key: "sand", label: "Arena", dot: "bg-amber-200" },
  { key: "mono", label: "Minimal", dot: "bg-slate-400" },
];

const empty = (count: number) => Array.from({ length: count }, () => "");

export function createDefaultContent(
  key: PlannerTemplateKey,
  today: string,
): PlannerContent {
  if (key === "monthly") {
    const content: MonthlyContent = {
      month: today.slice(0, 7),
      goal: "",
      dayNotes: {},
      subjects: empty(8),
      importantDates: empty(5),
      exams: empty(6),
      assignments: empty(4),
      notes: "",
      habits: [
        "Estudiar",
        "Asistir a clases",
        "Hacer ejercicio",
        "Leer",
        "Dormir bien",
      ].map((name) => ({ name, days: Array(31).fill(false) })),
    };
    return content;
  }

  if (key === "deliveries_exams") {
    const content: DeliveriesContent = {
      period: "",
      objective: "",
      tasks: Array.from({ length: 8 }, () => ({
        subject: "",
        activity: "",
        date: "",
        priority: "media" as const,
        status: "pendiente" as const,
      })),
      exams: Array.from({ length: 6 }, () => ({
        subject: "",
        topic: "",
        date: "",
        time: "",
        room: "",
      })),
      projects: empty(6),
      important: empty(6),
      notes: "",
    };
    return content;
  }

  if (key === "class_schedule") {
    const content: ClassScheduleContent = {
      name: "",
      career: "",
      semester: "",
      schedule: {},
      subjects: empty(8),
      professors: empty(8),
      reminders: empty(5),
      goals: empty(5),
    };
    return content;
  }

  if (key === "daily_study") {
    const content: DailyStudyContent = {
      date: today,
      subject: "",
      mood: "🙂",
      objective: "",
      schedule: {},
      tasks: empty(7),
      pomodoros: Array(10).fill(false),
      duration: "25",
      priorities: empty(5),
      reminders: empty(5),
      reflection: "",
    };
    return content;
  }

  if (key === "weekly") {
    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const content: WeeklyContent = {
      weekOf: today,
      goal: "",
      days: Object.fromEntries(
        dayNames.map((day) => [
          day,
          { priorities: empty(3), tasks: empty(5), note: "" },
        ]),
      ),
      topPriorities: empty(3),
      pending: empty(5),
      exams: empty(4),
      habits: [
        "Estudiar",
        "Asistir a clases",
        "Hacer ejercicio",
        "Leer",
        "Dormir bien",
      ].map((name) => ({ name, days: Array(7).fill(false) })),
      notes: "",
    };
    return content;
  }

  const content: ProjectContent = {
    projectName: "",
    objective: "",
    deadline: "",
    owner: "",
    milestones: empty(5),
    backlog: empty(6),
    inProgress: empty(6),
    done: empty(6),
    notes: "",
    resources: empty(5),
  };
  return content;
}

export function templateMeta(key: PlannerTemplateKey) {
  return TEMPLATE_CATALOG.find((item) => item.key === key) ?? TEMPLATE_CATALOG[0];
}
