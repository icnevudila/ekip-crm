import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder = "Ara" }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
