export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`h-11 shrink-0 border-b-2 px-3 text-sm font-medium ${
            value === tab.id ? "border-accent text-accent" : "border-transparent text-zinc-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
