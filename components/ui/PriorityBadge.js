import { PRIORITIES, labelOf } from "@/lib/constants";

const TONE = {
  low: "bg-zinc-100 text-zinc-600",
  normal: "bg-slate-100 text-slate-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-rose-50 text-rose-700",
};

export default function PriorityBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE[value] || TONE.normal}`}>
      {labelOf(PRIORITIES, value)}
    </span>
  );
}
