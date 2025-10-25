import { useMemo } from 'react';

export default function ChartCard({ title, data, color = 'emerald' }) {
  const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const bg = color === 'emerald' ? 'from-emerald-600 to-emerald-500'
    : color === 'blue' ? 'from-blue-600 to-blue-500'
    : 'from-slate-600 to-slate-500';

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 text-sm text-slate-400">{title}</div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{d.label}</span>
              <span>{d.value.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-2 rounded bg-slate-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${bg}`}
                style={{ width: `${(d.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>    
    </div>
  );
}