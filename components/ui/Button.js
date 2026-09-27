export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none ring-accent/15 focus:border-accent focus:ring-4";

export const textareaClass =
  "min-h-28 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none ring-accent/15 focus:border-accent focus:ring-4";

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export default function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "bg-accent text-white hover:bg-[#2f4fe0]",
    secondary: "border border-line bg-white text-ink hover:bg-zinc-50",
    ghost: "text-zinc-600 hover:bg-zinc-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
