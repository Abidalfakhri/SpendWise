export default function SummaryWidget({ title, items }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 text-sm text-slate-400">{title}</div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="flex justify-between text-sm">
            <span className="text-slate-300">{it.label}</span>
            <span className="text-slate-400">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}