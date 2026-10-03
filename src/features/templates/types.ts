export type PlannerTemplateKey =
  | "monthly"
  | "deliveries_exams"
  | "class_schedule"
  | "daily_study"
  | "weekly"
  | "project";

export type PlannerAccent =
  | "sky"
  | "lavender"
  | "rose"
  | "sage"
  | "sand"
  | "mono";

export type PlannerDocument = {
  id: string;
  template_key: PlannerTemplateKey;
  title: string;
  accent: PlannerAccent;
  content: PlannerContent;
  created_at: string;
  updated_at: string;
};

export type MonthlyHabit = { name: string; days: boolean[] };

export type MonthlyContent = {
  month: string;
  goal: string;
  dayNotes: Record<string, string>;
  subjects: string[];
  importantDates: string[];
  exams: string[];
  assignments: string[];
  notes: string;
  habits: MonthlyHabit[];
};

export type DeliveryTask = {
  subject: string;
  activity: string;
  date: string;
  priority: "alta" | "media" | "baja";
  status: "pendiente" | "en_proceso" | "completada";
};

export type ExamPlan = {
  subject: string;
  topic: string;
  date: string;
  time: string;
  room: string;
};

export type DeliveriesContent = {
  period: string;
  objective: string;
  tasks: DeliveryTask[];
  exams: ExamPlan[];
  projects: string[];
  important: string[];
  notes: string;
};

export type ClassScheduleContent = {
  name: string;
  career: string;
  semester: string;
  schedule: Record<string, string>;
  subjects: string[];
  professors: string[];
  reminders: string[];
  goals: string[];
};

export type DailyStudyContent = {
  date: string;
  subject: string;
  mood: string;
  objective: string;
  schedule: Record<string, string>;
  tasks: string[];
  pomodoros: boolean[];
  duration: string;
  priorities: string[];
  reminders: string[];
  reflection: string;
};

export type WeeklyDay = {
  priorities: string[];
  tasks: string[];
  note: string;
};

export type WeeklyHabit = { name: string; days: boolean[] };

export type WeeklyContent = {
  weekOf: string;
  goal: string;
  days: Record<string, WeeklyDay>;
  topPriorities: string[];
  pending: string[];
  exams: string[];
  habits: WeeklyHabit[];
  notes: string;
};

export type ProjectContent = {
  projectName: string;
  objective: string;
  deadline: string;
  owner: string;
  milestones: string[];
  backlog: string[];
  inProgress: string[];
  done: string[];
  notes: string;
  resources: string[];
};

export type PlannerContent =
  | MonthlyContent
  | DeliveriesContent
  | ClassScheduleContent
  | DailyStudyContent
  | WeeklyContent
  | ProjectContent;
