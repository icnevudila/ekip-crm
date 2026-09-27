import { CUSTOMER_STATUSES, GOAL_STATUSES, PROJECT_STATUSES, SUBSCRIPTION_STATUSES, TASK_STATUSES, labelOf } from "@/lib/constants";

const TONE = {
  todo: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-sky-50 text-sky-700",
  review: "bg-amber-50 text-amber-800",
  done: "bg-emerald-50 text-emerald-700",
  planning: "bg-zinc-100 text-zinc-700",
  active: "bg-emerald-50 text-emerald-700",
  development: "bg-sky-50 text-sky-700",
  testing: "bg-violet-50 text-violet-700",
  on_hold: "bg-amber-50 text-amber-800",
  completed: "bg-emerald-50 text-emerald-700",
  archived: "bg-zinc-100 text-zinc-500",
  lead: "bg-sky-50 text-sky-700",
  inactive: "bg-zinc-100 text-zinc-500",
  trial: "bg-violet-50 text-violet-700",
  payment_pending: "bg-amber-50 text-amber-800",
  paused: "bg-zinc-100 text-zinc-600",
  cancelled: "bg-rose-50 text-rose-700",
  in_progress_goal: "bg-sky-50 text-sky-700",
};

const LISTS = {
  task: TASK_STATUSES,
  project: PROJECT_STATUSES,
  customer: CUSTOMER_STATUSES,
  subscription: SUBSCRIPTION_STATUSES,
  goal: GOAL_STATUSES,
};

export default function StatusBadge({ kind = "task", value }) {
  const tone = kind === "goal" && value === "in_progress" ? TONE.in_progress_goal : TONE[value] || TONE.todo;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {labelOf(LISTS[kind] || TASK_STATUSES, value)}
    </span>
  );
}
